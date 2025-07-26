
import { supabase } from '@/integrations/supabase/client';

export class SecureStorage {
  private static readonly ENCRYPTION_KEY = 'crypto-trader-encryption-key-v1';

  // Simple encryption for demo - in production use proper encryption
  static async storeSecureCredentials(
    exchangeName: string,
    apiKey: string,
    apiSecret: string,
    passphrase?: string
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // In production, use proper encryption libraries like crypto-js or sodium
    const encryptedApiKey = btoa(apiKey); // Base64 encoding for demo
    const encryptedApiSecret = btoa(apiSecret);
    const encryptedPassphrase = passphrase ? btoa(passphrase) : null;

    const { error } = await supabase
      .from('real_trading_credentials')
      .insert({
        user_id: user.id,
        exchange_name: exchangeName,
        api_key_encrypted: encryptedApiKey,
        api_secret_encrypted: encryptedApiSecret,
        passphrase_encrypted: encryptedPassphrase,
        encryption_key_id: SecureStorage.ENCRYPTION_KEY,
        is_testnet: true, // Start with testnet
        permissions: { read: true, trade: false } // Start with read-only
      });

    if (error) throw error;
  }

  static async getDecryptedCredentials(credentialId: string): Promise<{
    apiKey: string;
    apiSecret: string;
    passphrase?: string;
  } | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('real_trading_credentials')
      .select('api_key_encrypted, api_secret_encrypted, passphrase_encrypted')
      .eq('id', credentialId)
      .eq('user_id', user.id)
      .single();

    if (error || !data) return null;

    // In production, use proper decryption
    return {
      apiKey: atob(data.api_key_encrypted),
      apiSecret: atob(data.api_secret_encrypted),
      passphrase: data.passphrase_encrypted ? atob(data.passphrase_encrypted) : undefined
    };
  }
}
