
-- Create trader_follows table for social trading functionality
CREATE TABLE public.trader_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trader_name TEXT NOT NULL,
  trader_category TEXT NOT NULL DEFAULT 'Other',
  followed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.trader_follows ENABLE ROW LEVEL SECURITY;

-- Create policies for trader_follows
CREATE POLICY "Users can view their own trader follows" 
  ON public.trader_follows 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trader follows" 
  ON public.trader_follows 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trader follows" 
  ON public.trader_follows 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trader follows" 
  ON public.trader_follows 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add unique constraint to prevent duplicate follows
ALTER TABLE public.trader_follows 
ADD CONSTRAINT unique_user_trader_follow 
UNIQUE (user_id, trader_name);
