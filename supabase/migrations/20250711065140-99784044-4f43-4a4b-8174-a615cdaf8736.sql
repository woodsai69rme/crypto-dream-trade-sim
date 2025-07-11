-- Phase 1: Fix Core Account System - Complete Implementation

-- Add unique constraint to prevent duplicate templates
ALTER TABLE public.account_templates ADD CONSTRAINT unique_template_name UNIQUE (name);

-- Create function to auto-create accounts for new users
CREATE OR REPLACE FUNCTION public.create_default_accounts_for_user(user_id_param UUID)
RETURNS VOID AS $$
DECLARE
  template_record RECORD;
BEGIN
  -- Check if user already has accounts
  IF EXISTS (SELECT 1 FROM public.paper_trading_accounts WHERE user_id = user_id_param) THEN
    RETURN;
  END IF;
  
  -- Create default account using Balanced Starter template
  SELECT * INTO template_record FROM public.account_templates WHERE name = 'Balanced Starter' LIMIT 1;
  
  IF FOUND THEN
    INSERT INTO public.paper_trading_accounts (
      user_id, account_name, account_type, risk_level, balance, initial_balance,
      max_daily_loss, max_position_size, trading_strategy, color_theme, icon, 
      tags, description, status, is_default
    ) VALUES (
      user_id_param, 'My Trading Account', template_record.account_type, template_record.risk_level,
      template_record.initial_balance, template_record.initial_balance, template_record.max_daily_loss,
      template_record.max_position_size, template_record.trading_strategy, template_record.color_theme,
      template_record.icon, template_record.tags, template_record.description, 'active', true
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update comprehensive_audit RLS policy to fix violations
DROP POLICY IF EXISTS "Users can manage their own audit logs" ON public.comprehensive_audit;
CREATE POLICY "Users can manage their own audit logs" 
ON public.comprehensive_audit 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Ensure all authenticated users have accounts
CREATE OR REPLACE FUNCTION public.ensure_user_accounts()
RETURNS VOID AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Get all users and ensure they have accounts
  FOR user_record IN SELECT id FROM auth.users LOOP
    PERFORM public.create_default_accounts_for_user(user_record.id);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the function to create accounts for existing users
SELECT public.ensure_user_accounts();

-- Add authentication check function for better error handling
CREATE OR REPLACE FUNCTION public.check_user_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Update paper_trading_accounts RLS policies to be more explicit
DROP POLICY IF EXISTS "Users can manage their own accounts" ON public.paper_trading_accounts;
CREATE POLICY "Users can manage their own accounts" 
ON public.paper_trading_accounts 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add helpful function to manually create account if needed
CREATE OR REPLACE FUNCTION public.manual_create_account(p_user_id UUID DEFAULT auth.uid())
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  accounts_count INTEGER;
BEGIN
  -- Check if user is authenticated
  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not authenticated');
  END IF;
  
  -- Check existing accounts
  SELECT COUNT(*) INTO accounts_count FROM public.paper_trading_accounts WHERE user_id = p_user_id;
  
  IF accounts_count > 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'User already has accounts', 'count', accounts_count);
  END IF;
  
  -- Create accounts
  PERFORM public.create_default_accounts_for_user(p_user_id);
  
  -- Verify creation
  SELECT COUNT(*) INTO accounts_count FROM public.paper_trading_accounts WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object('success', true, 'accounts_created', accounts_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;