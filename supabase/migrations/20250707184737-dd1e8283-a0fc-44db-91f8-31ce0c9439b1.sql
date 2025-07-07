
-- Create user profiles table with proper foreign key
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  trading_experience TEXT DEFAULT 'beginner',
  risk_tolerance TEXT DEFAULT 'medium',
  default_position_size NUMERIC DEFAULT 1000.00,
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "trades": true, "alerts": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Update the handle_new_user function to create profile with proper data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a profile with default paper trading balance
  INSERT INTO public.profiles (id, email, display_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'user'), ' ', '_')) || '_' || SUBSTR(NEW.id::text, 1, 8)
  );

  -- Create a default paper trading account
  INSERT INTO public.paper_trading_accounts (
    user_id, account_name, account_type, risk_level, balance, initial_balance, is_default
  ) VALUES (
    NEW.id, 'My Default Account', 'balanced', 'medium', 100000.00, 100000.00, true
  );

  -- Create a default portfolio for the new user
  INSERT INTO public.portfolios (user_id, name, is_default, mode, initial_balance, current_balance, total_value)
  VALUES (
    NEW.id,
    'My Paper Portfolio',
    true,
    'paper',
    100000.00,
    100000.00,
    100000.00
  );

  -- Create a default watchlist with popular cryptocurrencies
  INSERT INTO public.watchlists (user_id, name, is_default, symbols)
  VALUES (
    NEW.id,
    'My Watchlist',
    true,
    ARRAY['bitcoin', 'ethereum', 'solana', 'cardano', 'ripple']
  );

  -- Create initial AI trading bots
  PERFORM create_initial_trading_bots(NEW.id);

  -- Create default user settings
  INSERT INTO public.user_settings (user_id, setting_name, setting_value) VALUES
    (NEW.id, 'ai_bots_enabled', 'false'),
    (NEW.id, 'following_enabled', 'false'),
    (NEW.id, 'notifications_enabled', 'true'),
    (NEW.id, 'dark_mode', 'true'),
    (NEW.id, 'auto_refresh', 'true'),
    (NEW.id, 'risk_alerts', 'true');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to populate default user settings for existing users
CREATE OR REPLACE FUNCTION public.populate_default_settings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM auth.users LOOP
        -- Insert default settings if they don't exist
        INSERT INTO public.user_settings (user_id, setting_name, setting_value) 
        SELECT user_record.id, setting_name, setting_value
        FROM (VALUES
            ('ai_bots_enabled', 'false'::jsonb),
            ('following_enabled', 'false'::jsonb),
            ('notifications_enabled', 'true'::jsonb),
            ('dark_mode', 'true'::jsonb),
            ('auto_refresh', 'true'::jsonb),
            ('risk_alerts', 'true'::jsonb)
        ) AS default_settings(setting_name, setting_value)
        ON CONFLICT (user_id, setting_name) DO NOTHING;
    END LOOP;
END;
$$;

-- Execute the function to populate settings for existing users
SELECT populate_default_settings();

-- Enable realtime for profiles
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add indexes for better performance
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_user_settings_lookup ON public.user_settings(user_id, setting_name);
