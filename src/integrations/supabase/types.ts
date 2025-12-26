export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_trading_bots: {
        Row: {
          account_id: string | null
          ai_model: string | null
          backtest_results: Json | null
          config: Json | null
          cool_down_minutes: number | null
          created_at: string | null
          current_balance: number | null
          description: string | null
          error_message: string | null
          id: string
          last_signal_at: string | null
          last_trade_at: string | null
          losing_trades: number | null
          max_daily_trades: number | null
          max_drawdown: number | null
          max_position_size: number | null
          name: string
          paper_balance: number | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          sharpe_ratio: number | null
          status: Database["public"]["Enums"]["bot_status"] | null
          stop_loss_percentage: number | null
          strategy: string
          take_profit_percentage: number | null
          target_symbols: string[] | null
          total_pnl: number | null
          total_trades: number | null
          trading_hours: Json | null
          trailing_stop: boolean | null
          trailing_stop_percentage: number | null
          updated_at: string | null
          use_ai_signals: boolean | null
          use_sentiment_analysis: boolean | null
          use_technical_analysis: boolean | null
          user_id: string
          win_rate: number | null
          winning_trades: number | null
        }
        Insert: {
          account_id?: string | null
          ai_model?: string | null
          backtest_results?: Json | null
          config?: Json | null
          cool_down_minutes?: number | null
          created_at?: string | null
          current_balance?: number | null
          description?: string | null
          error_message?: string | null
          id?: string
          last_signal_at?: string | null
          last_trade_at?: string | null
          losing_trades?: number | null
          max_daily_trades?: number | null
          max_drawdown?: number | null
          max_position_size?: number | null
          name: string
          paper_balance?: number | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          sharpe_ratio?: number | null
          status?: Database["public"]["Enums"]["bot_status"] | null
          stop_loss_percentage?: number | null
          strategy: string
          take_profit_percentage?: number | null
          target_symbols?: string[] | null
          total_pnl?: number | null
          total_trades?: number | null
          trading_hours?: Json | null
          trailing_stop?: boolean | null
          trailing_stop_percentage?: number | null
          updated_at?: string | null
          use_ai_signals?: boolean | null
          use_sentiment_analysis?: boolean | null
          use_technical_analysis?: boolean | null
          user_id: string
          win_rate?: number | null
          winning_trades?: number | null
        }
        Update: {
          account_id?: string | null
          ai_model?: string | null
          backtest_results?: Json | null
          config?: Json | null
          cool_down_minutes?: number | null
          created_at?: string | null
          current_balance?: number | null
          description?: string | null
          error_message?: string | null
          id?: string
          last_signal_at?: string | null
          last_trade_at?: string | null
          losing_trades?: number | null
          max_daily_trades?: number | null
          max_drawdown?: number | null
          max_position_size?: number | null
          name?: string
          paper_balance?: number | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          sharpe_ratio?: number | null
          status?: Database["public"]["Enums"]["bot_status"] | null
          stop_loss_percentage?: number | null
          strategy?: string
          take_profit_percentage?: number | null
          target_symbols?: string[] | null
          total_pnl?: number | null
          total_trades?: number | null
          trading_hours?: Json | null
          trailing_stop?: boolean | null
          trailing_stop_percentage?: number | null
          updated_at?: string | null
          use_ai_signals?: boolean | null
          use_sentiment_analysis?: boolean | null
          use_technical_analysis?: boolean | null
          user_id?: string
          win_rate?: number | null
          winning_trades?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_trading_bots_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      api_integrations: {
        Row: {
          additional_config: Json | null
          api_key_encrypted: string | null
          api_secret_encrypted: string | null
          category: string
          created_at: string | null
          encryption_iv: string | null
          error_count: number | null
          id: string
          is_active: boolean | null
          last_error: string | null
          last_used_at: string | null
          rate_limit_remaining: number | null
          service_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          additional_config?: Json | null
          api_key_encrypted?: string | null
          api_secret_encrypted?: string | null
          category: string
          created_at?: string | null
          encryption_iv?: string | null
          error_count?: number | null
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_used_at?: string | null
          rate_limit_remaining?: number | null
          service_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          additional_config?: Json | null
          api_key_encrypted?: string | null
          api_secret_encrypted?: string | null
          category?: string
          created_at?: string | null
          encryption_iv?: string | null
          error_count?: number | null
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_used_at?: string | null
          rate_limit_remaining?: number | null
          service_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          ip_address: unknown
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          request_id: string | null
          success: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          request_id?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          request_id?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bot_strategy_templates: {
        Row: {
          backtested_drawdown: number | null
          backtested_roi: number | null
          backtested_sharpe: number | null
          category: string | null
          created_at: string | null
          created_by: string | null
          default_config: Json
          description: string | null
          id: string
          indicators: string[] | null
          is_public: boolean | null
          min_balance: number | null
          name: string
          popularity_score: number | null
          recommended_pairs: string[] | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          strategy_type: string
          updated_at: string | null
        }
        Insert: {
          backtested_drawdown?: number | null
          backtested_roi?: number | null
          backtested_sharpe?: number | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          default_config: Json
          description?: string | null
          id?: string
          indicators?: string[] | null
          is_public?: boolean | null
          min_balance?: number | null
          name: string
          popularity_score?: number | null
          recommended_pairs?: string[] | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          strategy_type: string
          updated_at?: string | null
        }
        Update: {
          backtested_drawdown?: number | null
          backtested_roi?: number | null
          backtested_sharpe?: number | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          default_config?: Json
          description?: string | null
          id?: string
          indicators?: string[] | null
          is_public?: boolean | null
          min_balance?: number | null
          name?: string
          popularity_score?: number | null
          recommended_pairs?: string[] | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          strategy_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bot_trades: {
        Row: {
          bot_id: string
          confidence: number | null
          created_at: string | null
          executed: boolean | null
          execution_error: string | null
          id: string
          indicators_used: Json | null
          market_conditions: Json | null
          reasoning: string | null
          signal_strength: number | null
          trade_id: string | null
          user_id: string
        }
        Insert: {
          bot_id: string
          confidence?: number | null
          created_at?: string | null
          executed?: boolean | null
          execution_error?: string | null
          id?: string
          indicators_used?: Json | null
          market_conditions?: Json | null
          reasoning?: string | null
          signal_strength?: number | null
          trade_id?: string | null
          user_id: string
        }
        Update: {
          bot_id?: string
          confidence?: number | null
          created_at?: string | null
          executed?: boolean | null
          execution_error?: string | null
          id?: string
          indicators_used?: Json | null
          market_conditions?: Json | null
          reasoning?: string | null
          signal_strength?: number | null
          trade_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_trades_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "ai_trading_bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bot_trades_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      circuit_breakers: {
        Row: {
          account_id: string | null
          action_on_trigger: string | null
          auto_reset: boolean | null
          breaker_type: string
          cooldown_minutes: number | null
          created_at: string | null
          current_value: number | null
          id: string
          is_triggered: boolean | null
          reset_at: string | null
          threshold: number
          triggered_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          action_on_trigger?: string | null
          auto_reset?: boolean | null
          breaker_type: string
          cooldown_minutes?: number | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          is_triggered?: boolean | null
          reset_at?: string | null
          threshold: number
          triggered_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          action_on_trigger?: string | null
          auto_reset?: boolean | null
          breaker_type?: string
          cooldown_minutes?: number | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          is_triggered?: boolean | null
          reset_at?: string | null
          threshold?: number
          triggered_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circuit_breakers_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_stops: {
        Row: {
          account_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          orders_cancelled: Json | null
          positions_closed: Json | null
          reason: string
          released_at: string | null
          released_by: string | null
          total_loss_prevented: number | null
          triggered_by: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          orders_cancelled?: Json | null
          positions_closed?: Json | null
          reason: string
          released_at?: string | null
          released_by?: string | null
          total_loss_prevented?: number | null
          triggered_by: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          orders_cancelled?: Json | null
          positions_closed?: Json | null
          reason?: string
          released_at?: string | null
          released_by?: string | null
          total_loss_prevented?: number | null
          triggered_by?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_stops_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_connections: {
        Row: {
          account_id: string | null
          api_key_encrypted: string
          api_secret_encrypted: string
          connection_status: string | null
          created_at: string | null
          encryption_iv: string
          encryption_salt: string
          error_message: string | null
          exchange: Database["public"]["Enums"]["exchange_name"]
          id: string
          ip_whitelist: string[] | null
          is_active: boolean | null
          is_testnet: boolean | null
          last_connected_at: string | null
          last_sync_at: string | null
          passphrase_encrypted: string | null
          permissions: Json | null
          rate_limit_remaining: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          api_key_encrypted: string
          api_secret_encrypted: string
          connection_status?: string | null
          created_at?: string | null
          encryption_iv: string
          encryption_salt: string
          error_message?: string | null
          exchange: Database["public"]["Enums"]["exchange_name"]
          id?: string
          ip_whitelist?: string[] | null
          is_active?: boolean | null
          is_testnet?: boolean | null
          last_connected_at?: string | null
          last_sync_at?: string | null
          passphrase_encrypted?: string | null
          permissions?: Json | null
          rate_limit_remaining?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          api_key_encrypted?: string
          api_secret_encrypted?: string
          connection_status?: string | null
          created_at?: string | null
          encryption_iv?: string
          encryption_salt?: string
          error_message?: string | null
          exchange?: Database["public"]["Enums"]["exchange_name"]
          id?: string
          ip_whitelist?: string[] | null
          is_active?: boolean | null
          is_testnet?: boolean | null
          last_connected_at?: string | null
          last_sync_at?: string | null
          passphrase_encrypted?: string | null
          permissions?: Json | null
          rate_limit_remaining?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exchange_connections_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      followed_traders: {
        Row: {
          copy_percentage: number | null
          copy_stop_loss: boolean | null
          copy_take_profit: boolean | null
          copy_trading_enabled: boolean | null
          created_at: string | null
          follower_account_id: string | null
          follower_id: string
          id: string
          is_active: boolean | null
          max_position_size: number | null
          total_copied_trades: number | null
          total_pnl_from_copies: number | null
          trader_id: string
          updated_at: string | null
        }
        Insert: {
          copy_percentage?: number | null
          copy_stop_loss?: boolean | null
          copy_take_profit?: boolean | null
          copy_trading_enabled?: boolean | null
          created_at?: string | null
          follower_account_id?: string | null
          follower_id: string
          id?: string
          is_active?: boolean | null
          max_position_size?: number | null
          total_copied_trades?: number | null
          total_pnl_from_copies?: number | null
          trader_id: string
          updated_at?: string | null
        }
        Update: {
          copy_percentage?: number | null
          copy_stop_loss?: boolean | null
          copy_take_profit?: boolean | null
          copy_trading_enabled?: boolean | null
          created_at?: string | null
          follower_account_id?: string | null
          follower_id?: string
          id?: string
          is_active?: boolean | null
          max_position_size?: number | null
          total_copied_trades?: number | null
          total_pnl_from_copies?: number | null
          trader_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "followed_traders_follower_account_id_fkey"
            columns: ["follower_account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      market_data_cache: {
        Row: {
          ath: number | null
          ath_date: string | null
          circulating_supply: number | null
          exchange: string | null
          high_24h: number | null
          id: string
          last_updated: string | null
          low_24h: number | null
          market_cap: number | null
          price: number | null
          price_change_24h: number | null
          price_change_percentage_24h: number | null
          symbol: string
          total_supply: number | null
          volume_24h: number | null
        }
        Insert: {
          ath?: number | null
          ath_date?: string | null
          circulating_supply?: number | null
          exchange?: string | null
          high_24h?: number | null
          id?: string
          last_updated?: string | null
          low_24h?: number | null
          market_cap?: number | null
          price?: number | null
          price_change_24h?: number | null
          price_change_percentage_24h?: number | null
          symbol: string
          total_supply?: number | null
          volume_24h?: number | null
        }
        Update: {
          ath?: number | null
          ath_date?: string | null
          circulating_supply?: number | null
          exchange?: string | null
          high_24h?: number | null
          id?: string
          last_updated?: string | null
          low_24h?: number | null
          market_cap?: number | null
          price?: number | null
          price_change_24h?: number | null
          price_change_percentage_24h?: number | null
          symbol?: string
          total_supply?: number | null
          volume_24h?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_holdings: {
        Row: {
          account_id: string
          allocation_percentage: number | null
          average_buy_price: number | null
          cost_basis: number | null
          created_at: string | null
          current_price: number | null
          current_value: number | null
          id: string
          last_trade_at: string | null
          quantity: number
          realized_pnl: number | null
          symbol: string
          unrealized_pnl: number | null
          unrealized_pnl_percentage: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          allocation_percentage?: number | null
          average_buy_price?: number | null
          cost_basis?: number | null
          created_at?: string | null
          current_price?: number | null
          current_value?: number | null
          id?: string
          last_trade_at?: string | null
          quantity?: number
          realized_pnl?: number | null
          symbol: string
          unrealized_pnl?: number | null
          unrealized_pnl_percentage?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          allocation_percentage?: number | null
          average_buy_price?: number | null
          cost_basis?: number | null
          created_at?: string | null
          current_price?: number | null
          current_value?: number | null
          id?: string
          last_trade_at?: string | null
          quantity?: number
          realized_pnl?: number | null
          symbol?: string
          unrealized_pnl?: number | null
          unrealized_pnl_percentage?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_holdings_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      price_alerts: {
        Row: {
          condition: string
          created_at: string | null
          current_price: number | null
          id: string
          is_active: boolean | null
          is_recurring: boolean | null
          is_triggered: boolean | null
          notification_sent: boolean | null
          symbol: string
          target_price: number
          triggered_at: string | null
          user_id: string
        }
        Insert: {
          condition: string
          created_at?: string | null
          current_price?: number | null
          id?: string
          is_active?: boolean | null
          is_recurring?: boolean | null
          is_triggered?: boolean | null
          notification_sent?: boolean | null
          symbol: string
          target_price: number
          triggered_at?: string | null
          user_id: string
        }
        Update: {
          condition?: string
          created_at?: string | null
          current_price?: number | null
          id?: string
          is_active?: boolean | null
          is_recurring?: boolean | null
          is_triggered?: boolean | null
          notification_sent?: boolean | null
          symbol?: string
          target_price?: number
          triggered_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          email_verified: boolean | null
          full_name: string | null
          id: string
          last_login_at: string | null
          login_count: number | null
          phone: string | null
          phone_verified: boolean | null
          preferred_currency: string | null
          timezone: string | null
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          id: string
          last_login_at?: string | null
          login_count?: number | null
          phone?: string | null
          phone_verified?: boolean | null
          preferred_currency?: string | null
          timezone?: string | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          login_count?: number | null
          phone?: string | null
          phone_verified?: boolean | null
          preferred_currency?: string | null
          timezone?: string | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      risk_alerts: {
        Row: {
          account_id: string | null
          acknowledged_at: string | null
          alert_type: Database["public"]["Enums"]["alert_type"]
          auto_action_taken: string | null
          created_at: string | null
          current_value: number | null
          id: string
          is_acknowledged: boolean | null
          message: string
          metadata: Json | null
          severity: Database["public"]["Enums"]["alert_severity"]
          symbol: string | null
          threshold_value: number | null
          title: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          acknowledged_at?: string | null
          alert_type: Database["public"]["Enums"]["alert_type"]
          auto_action_taken?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          is_acknowledged?: boolean | null
          message: string
          metadata?: Json | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          symbol?: string | null
          threshold_value?: number | null
          title: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          acknowledged_at?: string | null
          alert_type?: Database["public"]["Enums"]["alert_type"]
          auto_action_taken?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          is_acknowledged?: boolean | null
          message?: string
          metadata?: Json | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          symbol?: string | null
          threshold_value?: number | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_alerts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_copies: {
        Row: {
          copied_amount: number | null
          copied_pnl: number | null
          copied_trade_id: string | null
          copy_percentage: number | null
          created_at: string | null
          error_message: string | null
          follow_id: string
          follower_id: string
          id: string
          original_amount: number | null
          original_pnl: number | null
          original_trade_id: string
          status: string | null
          trader_id: string
        }
        Insert: {
          copied_amount?: number | null
          copied_pnl?: number | null
          copied_trade_id?: string | null
          copy_percentage?: number | null
          created_at?: string | null
          error_message?: string | null
          follow_id: string
          follower_id: string
          id?: string
          original_amount?: number | null
          original_pnl?: number | null
          original_trade_id: string
          status?: string | null
          trader_id: string
        }
        Update: {
          copied_amount?: number | null
          copied_pnl?: number | null
          copied_trade_id?: string | null
          copy_percentage?: number | null
          created_at?: string | null
          error_message?: string | null
          follow_id?: string
          follower_id?: string
          id?: string
          original_amount?: number | null
          original_pnl?: number | null
          original_trade_id?: string
          status?: string | null
          trader_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_copies_copied_trade_id_fkey"
            columns: ["copied_trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_copies_follow_id_fkey"
            columns: ["follow_id"]
            isOneToOne: false
            referencedRelation: "followed_traders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_copies_original_trade_id_fkey"
            columns: ["original_trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      trader_stats: {
        Row: {
          avg_trade_duration: number | null
          badges: Json | null
          bio: string | null
          copiers_count: number | null
          created_at: string | null
          display_name: string | null
          followers_count: number | null
          id: string
          is_public: boolean | null
          is_verified: boolean | null
          last_trade_at: string | null
          max_drawdown: number | null
          rank: number | null
          sharpe_ratio: number | null
          total_pnl: number | null
          total_pnl_percentage: number | null
          total_trades: number | null
          trading_since: string | null
          updated_at: string | null
          user_id: string
          win_rate: number | null
          winning_trades: number | null
        }
        Insert: {
          avg_trade_duration?: number | null
          badges?: Json | null
          bio?: string | null
          copiers_count?: number | null
          created_at?: string | null
          display_name?: string | null
          followers_count?: number | null
          id?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          last_trade_at?: string | null
          max_drawdown?: number | null
          rank?: number | null
          sharpe_ratio?: number | null
          total_pnl?: number | null
          total_pnl_percentage?: number | null
          total_trades?: number | null
          trading_since?: string | null
          updated_at?: string | null
          user_id: string
          win_rate?: number | null
          winning_trades?: number | null
        }
        Update: {
          avg_trade_duration?: number | null
          badges?: Json | null
          bio?: string | null
          copiers_count?: number | null
          created_at?: string | null
          display_name?: string | null
          followers_count?: number | null
          id?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          last_trade_at?: string | null
          max_drawdown?: number | null
          rank?: number | null
          sharpe_ratio?: number | null
          total_pnl?: number | null
          total_pnl_percentage?: number | null
          total_trades?: number | null
          trading_since?: string | null
          updated_at?: string | null
          user_id?: string
          win_rate?: number | null
          winning_trades?: number | null
        }
        Relationships: []
      }
      trades: {
        Row: {
          account_id: string
          bot_id: string | null
          created_at: string | null
          exchange_connection_id: string | null
          executed_at: string | null
          executed_price: number | null
          executed_quantity: number | null
          execution_time_ms: number | null
          external_order_id: string | null
          fee: number | null
          fee_currency: string | null
          id: string
          is_paper: boolean | null
          is_simulated: boolean | null
          leverage: number | null
          margin_type: string | null
          metadata: Json | null
          order_type: Database["public"]["Enums"]["order_type"]
          pnl: number | null
          pnl_percentage: number | null
          price: number | null
          quantity: number
          reasoning: string | null
          side: Database["public"]["Enums"]["trade_side"]
          signal_source: string | null
          slippage: number | null
          status: Database["public"]["Enums"]["order_status"]
          stop_loss: number | null
          symbol: string
          take_profit: number | null
          total_value: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          bot_id?: string | null
          created_at?: string | null
          exchange_connection_id?: string | null
          executed_at?: string | null
          executed_price?: number | null
          executed_quantity?: number | null
          execution_time_ms?: number | null
          external_order_id?: string | null
          fee?: number | null
          fee_currency?: string | null
          id?: string
          is_paper?: boolean | null
          is_simulated?: boolean | null
          leverage?: number | null
          margin_type?: string | null
          metadata?: Json | null
          order_type?: Database["public"]["Enums"]["order_type"]
          pnl?: number | null
          pnl_percentage?: number | null
          price?: number | null
          quantity: number
          reasoning?: string | null
          side: Database["public"]["Enums"]["trade_side"]
          signal_source?: string | null
          slippage?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          stop_loss?: number | null
          symbol: string
          take_profit?: number | null
          total_value?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          bot_id?: string | null
          created_at?: string | null
          exchange_connection_id?: string | null
          executed_at?: string | null
          executed_price?: number | null
          executed_quantity?: number | null
          execution_time_ms?: number | null
          external_order_id?: string | null
          fee?: number | null
          fee_currency?: string | null
          id?: string
          is_paper?: boolean | null
          is_simulated?: boolean | null
          leverage?: number | null
          margin_type?: string | null
          metadata?: Json | null
          order_type?: Database["public"]["Enums"]["order_type"]
          pnl?: number | null
          pnl_percentage?: number | null
          price?: number | null
          quantity?: number
          reasoning?: string | null
          side?: Database["public"]["Enums"]["trade_side"]
          signal_source?: string | null
          slippage?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          stop_loss?: number | null
          symbol?: string
          take_profit?: number | null
          total_value?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_exchange_connection_id_fkey"
            columns: ["exchange_connection_id"]
            isOneToOne: false
            referencedRelation: "exchange_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_accounts: {
        Row: {
          account_name: string
          account_type: Database["public"]["Enums"]["account_type"]
          auto_stop_loss: boolean | null
          created_at: string | null
          current_balance: number | null
          emergency_stop: boolean | null
          id: string
          initial_balance: number | null
          is_active: boolean | null
          is_default: boolean | null
          leverage_limit: number | null
          max_daily_loss: number | null
          max_drawdown: number | null
          max_position_size: number | null
          metadata: Json | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          total_pnl: number | null
          total_pnl_percentage: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_name: string
          account_type?: Database["public"]["Enums"]["account_type"]
          auto_stop_loss?: boolean | null
          created_at?: string | null
          current_balance?: number | null
          emergency_stop?: boolean | null
          id?: string
          initial_balance?: number | null
          is_active?: boolean | null
          is_default?: boolean | null
          leverage_limit?: number | null
          max_daily_loss?: number | null
          max_drawdown?: number | null
          max_position_size?: number | null
          metadata?: Json | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          total_pnl?: number | null
          total_pnl_percentage?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_name?: string
          account_type?: Database["public"]["Enums"]["account_type"]
          auto_stop_loss?: boolean | null
          created_at?: string | null
          current_balance?: number | null
          emergency_stop?: boolean | null
          id?: string
          initial_balance?: number | null
          is_active?: boolean | null
          is_default?: boolean | null
          leverage_limit?: number | null
          max_daily_loss?: number | null
          max_drawdown?: number | null
          max_position_size?: number | null
          metadata?: Json | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          total_pnl?: number | null
          total_pnl_percentage?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trading_signals: {
        Row: {
          bot_id: string | null
          confidence: number | null
          created_at: string | null
          executed: boolean | null
          execution_price: number | null
          expires_at: string | null
          id: string
          indicators: Json | null
          is_active: boolean | null
          price_at_signal: number | null
          reasoning: string | null
          result_pnl: number | null
          signal_type: Database["public"]["Enums"]["trade_side"]
          source: string
          stop_loss: number | null
          strength: number
          symbol: string
          target_price: number | null
          timeframe: string | null
          user_id: string | null
        }
        Insert: {
          bot_id?: string | null
          confidence?: number | null
          created_at?: string | null
          executed?: boolean | null
          execution_price?: number | null
          expires_at?: string | null
          id?: string
          indicators?: Json | null
          is_active?: boolean | null
          price_at_signal?: number | null
          reasoning?: string | null
          result_pnl?: number | null
          signal_type: Database["public"]["Enums"]["trade_side"]
          source: string
          stop_loss?: number | null
          strength: number
          symbol: string
          target_price?: number | null
          timeframe?: string | null
          user_id?: string | null
        }
        Update: {
          bot_id?: string | null
          confidence?: number | null
          created_at?: string | null
          executed?: boolean | null
          execution_price?: number | null
          expires_at?: string | null
          id?: string
          indicators?: Json | null
          is_active?: boolean | null
          price_at_signal?: number | null
          reasoning?: string | null
          result_pnl?: number | null
          signal_type?: Database["public"]["Enums"]["trade_side"]
          source?: string
          stop_loss?: number | null
          strength?: number
          symbol?: string
          target_price?: number | null
          timeframe?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trading_signals_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "ai_trading_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      watchlists: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          sort_order: number | null
          symbols: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          sort_order?: number | null
          symbols?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          sort_order?: number | null
          symbols?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      execute_trade: {
        Args: {
          p_account_id: string
          p_is_paper?: boolean
          p_order_type: Database["public"]["Enums"]["order_type"]
          p_price?: number
          p_quantity: number
          p_side: Database["public"]["Enums"]["trade_side"]
          p_stop_loss?: number
          p_symbol: string
          p_take_profit?: number
        }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_action: string
          p_entity_id?: string
          p_entity_type: string
          p_metadata?: Json
          p_new_values?: Json
          p_old_values?: Json
        }
        Returns: string
      }
    }
    Enums: {
      account_type: "paper" | "live" | "demo"
      alert_severity: "info" | "warning" | "critical" | "emergency"
      alert_type:
        | "price"
        | "volume"
        | "volatility"
        | "trade"
        | "risk"
        | "system"
      app_role: "admin" | "moderator" | "user" | "trader" | "viewer"
      bot_status: "active" | "paused" | "stopped" | "error" | "backtesting"
      exchange_name:
        | "binance"
        | "coinbase"
        | "kraken"
        | "kucoin"
        | "okx"
        | "deribit"
        | "bybit"
        | "huobi"
        | "bitfinex"
        | "gateio"
      order_status:
        | "pending"
        | "open"
        | "filled"
        | "partially_filled"
        | "cancelled"
        | "expired"
        | "rejected"
      order_type: "market" | "limit" | "stop" | "stop_limit" | "trailing_stop"
      risk_level: "conservative" | "moderate" | "aggressive" | "custom"
      trade_side: "buy" | "sell"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_type: ["paper", "live", "demo"],
      alert_severity: ["info", "warning", "critical", "emergency"],
      alert_type: ["price", "volume", "volatility", "trade", "risk", "system"],
      app_role: ["admin", "moderator", "user", "trader", "viewer"],
      bot_status: ["active", "paused", "stopped", "error", "backtesting"],
      exchange_name: [
        "binance",
        "coinbase",
        "kraken",
        "kucoin",
        "okx",
        "deribit",
        "bybit",
        "huobi",
        "bitfinex",
        "gateio",
      ],
      order_status: [
        "pending",
        "open",
        "filled",
        "partially_filled",
        "cancelled",
        "expired",
        "rejected",
      ],
      order_type: ["market", "limit", "stop", "stop_limit", "trailing_stop"],
      risk_level: ["conservative", "moderate", "aggressive", "custom"],
      trade_side: ["buy", "sell"],
    },
  },
} as const
