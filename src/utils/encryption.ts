
import { supabase } from '@/integrations/supabase/client';

// Encryption utilities for secure API key storage
export class SecureStorage {
  private static readonly ENCRYPTION_KEY_LENGTH = 32;
  
  // Generate a secure encryption key
  static generateEncryptionKey(): string {
    const array = new Uint8Array(this.ENCRYPTION_KEY_LENGTH);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Encrypt sensitive data using Web Crypto API
  static async encryptData(data: string, key: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(key.slice(0, 32).padEnd(32, '0'));
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encoder.encode(data)
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt sensitive data
  static async decryptData(encryptedData: string, key: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const keyData = encoder.encode(key.slice(0, 32).padEnd(32, '0'));
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );

      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encrypted
      );

      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Store encrypted credentials securely
  static async storeSecureCredentials(
    exchangeName: string,
    apiKey: string,
    apiSecret: string,
    passphrase?: string
  ): Promise<string> {
    const encryptionKey = this.generateEncryptionKey();
    
    const encryptedApiKey = await this.encryptData(apiKey, encryptionKey);
    const encryptedApiSecret = await this.encryptData(apiSecret, encryptionKey);
    const encryptedPassphrase = passphrase 
      ? await this.encryptData(passphrase, encryptionKey)
      : null;

    // Store in Supabase with proper encryption
    const { data, error } = await supabase
      .from('real_trading_credentials')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id || '',
        exchange_name: exchangeName,
        api_key_encrypted: encryptedApiKey,
        api_secret_encrypted: encryptedApiSecret,
        passphrase_encrypted: encryptedPassphrase,
        encryption_key_id: encryptionKey,
        is_testnet: true,
        is_active: false
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  // Retrieve and decrypt credentials
  static async getDecryptedCredentials(credentialId: string) {
    const { data, error } = await supabase
      .from('real_trading_credentials')
      .select('*')
      .eq('id', credentialId)
      .single();

    if (error) throw error;

    const decryptedApiKey = await this.decryptData(
      data.api_key_encrypted,
      data.encryption_key_id
    );
    const decryptedApiSecret = await this.decryptData(
      data.api_secret_encrypted,
      data.encryption_key_id
    );
    const decryptedPassphrase = data.passphrase_encrypted
      ? await this.decryptData(data.passphrase_encrypted, data.encryption_key_id)
      : null;

    return {
      apiKey: decryptedApiKey,
      apiSecret: decryptedApiSecret,
      passphrase: decryptedPassphrase,
      exchangeName: data.exchange_name,
      isTestnet: data.is_testnet
    };
  }
}
