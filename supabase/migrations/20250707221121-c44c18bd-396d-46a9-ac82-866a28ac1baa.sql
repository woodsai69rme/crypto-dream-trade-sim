-- Create wallet connections table
CREATE TABLE public.wallet_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_type TEXT NOT NULL CHECK (wallet_type IN ('metamask', 'walletconnect', 'coinbase', 'ledger')),
  wallet_address TEXT NOT NULL,
  wallet_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  balance NUMERIC DEFAULT 0,
  network TEXT NOT NULL DEFAULT 'ethereum',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create price alerts table
CREATE TABLE public.price_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  target_price NUMERIC NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('above', 'below')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_triggered BOOLEAN NOT NULL DEFAULT false,
  triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create social sentiment table
CREATE TABLE public.social_sentiment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'youtube', 'reddit', 'news')),
  sentiment_score NUMERIC NOT NULL DEFAULT 0,
  mention_count INTEGER NOT NULL DEFAULT 0,
  trending_rank INTEGER,
  data_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit trail table for comprehensive tracking
CREATE TABLE public.comprehensive_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id UUID,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wallet_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_sentiment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comprehensive_audit ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own wallet connections" 
ON public.wallet_connections 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own price alerts" 
ON public.price_alerts 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view social sentiment data" 
ON public.social_sentiment 
FOR SELECT 
USING (true);

CREATE POLICY "Users can view their own audit trail" 
ON public.comprehensive_audit 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_wallet_connections_updated_at
BEFORE UPDATE ON public.wallet_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function for comprehensive audit logging
CREATE OR REPLACE FUNCTION public.log_comprehensive_audit(
  p_account_id UUID,
  p_action_type TEXT,
  p_entity_type TEXT,
  p_entity_id TEXT,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.comprehensive_audit (
    user_id, account_id, action_type, entity_type, entity_id,
    old_values, new_values, metadata
  ) VALUES (
    auth.uid(), p_account_id, p_action_type, p_entity_type, p_entity_id,
    p_old_values, p_new_values, p_metadata
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;