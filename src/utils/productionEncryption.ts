
import CryptoJS from 'crypto-js';

export class ProductionSecureStorage {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_SIZE = 256;
  private static readonly IV_SIZE = 12; // 96 bits for GCM
  private static readonly TAG_SIZE = 16; // 128 bits for GCM
  private static readonly SALT_SIZE = 32;
  private static readonly ITERATIONS = 100000; // PBKDF2 iterations

  // Generate cryptographically secure encryption key
  private static async deriveKey(password: string, salt: CryptoJS.lib.WordArray): Promise<CryptoJS.lib.WordArray> {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: this.KEY_SIZE / 32,
      iterations: this.ITERATIONS,
      hasher: CryptoJS.algo.SHA256
    });
  }

  // Production-grade AES-256-GCM encryption
  static async encryptCredentials(data: string, masterKey: string): Promise<string> {
    try {
      // Generate random salt and IV
      const salt = CryptoJS.lib.WordArray.random(this.SALT_SIZE);
      const iv = CryptoJS.lib.WordArray.random(this.IV_SIZE);
      
      // Derive encryption key
      const key = await this.deriveKey(masterKey, salt);
      
      // Encrypt with AES-256-GCM
      const encrypted = CryptoJS.AES.encrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.GCM,
        padding: CryptoJS.pad.NoPadding
      });

      // Combine salt + iv + encrypted data + auth tag
      const combined = salt.toString() + ':' + iv.toString() + ':' + encrypted.toString();
      return combined;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt credentials');
    }
  }

  // Production-grade AES-256-GCM decryption
  static async decryptCredentials(encryptedData: string, masterKey: string): Promise<string> {
    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const salt = CryptoJS.enc.Hex.parse(parts[0]);
      const iv = CryptoJS.enc.Hex.parse(parts[1]);
      const encrypted = parts[2];
      
      // Derive decryption key
      const key = await this.deriveKey(masterKey, salt);
      
      // Decrypt with AES-256-GCM
      const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        iv: iv,
        mode: CryptoJS.mode.GCM,
        padding: CryptoJS.pad.NoPadding
      });

      const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
      if (!plaintext) {
        throw new Error('Decryption failed - invalid key or corrupted data');
      }

      return plaintext;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt credentials');
    }
  }

  // Secure key generation for new installations
  static generateMasterKey(): string {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }

  // Validate encryption integrity
  static async validateEncryption(data: string, masterKey: string): Promise<boolean> {
    try {
      const testData = 'test-validation-data';
      const encrypted = await this.encryptCredentials(testData, masterKey);
      const decrypted = await this.decryptCredentials(encrypted, masterKey);
      return decrypted === testData;
    } catch {
      return false;
    }
  }
}
