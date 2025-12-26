// AES-256-GCM Encryption Utilities for API Keys
// This provides production-grade encryption for exchange credentials

import { encode as base64Encode, decode as base64Decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const ITERATIONS = 100000;

// Get master encryption key from environment
function getMasterKey(): string {
  const key = Deno.env.get('ENCRYPTION_MASTER_KEY');
  if (!key) {
    throw new Error('ENCRYPTION_MASTER_KEY not configured');
  }
  return key;
}

// Derive encryption key from master key and salt using PBKDF2
async function deriveKey(masterKey: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(masterKey),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

// Generate random bytes
function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

// Encrypt data using AES-256-GCM
export async function encrypt(plaintext: string): Promise<{
  encrypted: string;
  iv: string;
  salt: string;
}> {
  const masterKey = getMasterKey();
  const encoder = new TextEncoder();
  const salt = generateRandomBytes(SALT_LENGTH);
  const iv = generateRandomBytes(IV_LENGTH);
  
  const key = await deriveKey(masterKey, salt);
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: iv },
    key,
    encoder.encode(plaintext)
  );
  
  return {
    encrypted: base64Encode(new Uint8Array(encryptedBuffer)),
    iv: base64Encode(iv),
    salt: base64Encode(salt)
  };
}

// Decrypt data using AES-256-GCM
export async function decrypt(
  encryptedData: string,
  ivString: string,
  saltString: string
): Promise<string> {
  const masterKey = getMasterKey();
  const decoder = new TextDecoder();
  
  const encrypted = base64Decode(encryptedData);
  const iv = base64Decode(ivString);
  const salt = base64Decode(saltString);
  
  const key = await deriveKey(masterKey, salt);
  
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: iv },
    key,
    encrypted
  );
  
  return decoder.decode(decryptedBuffer);
}

// Encrypt exchange credentials
export async function encryptCredentials(credentials: {
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
}): Promise<{
  apiKeyEncrypted: string;
  apiSecretEncrypted: string;
  passphraseEncrypted?: string;
  iv: string;
  salt: string;
}> {
  const salt = generateRandomBytes(SALT_LENGTH);
  const iv = generateRandomBytes(IV_LENGTH);
  const masterKey = getMasterKey();
  const key = await deriveKey(masterKey, salt);
  const encoder = new TextEncoder();
  
  const encryptApiKey = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: iv },
    key,
    encoder.encode(credentials.apiKey)
  );
  
  const encryptApiSecret = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: iv },
    key,
    encoder.encode(credentials.apiSecret)
  );
  
  let passphraseEncrypted: string | undefined;
  if (credentials.passphrase) {
    const encryptPassphrase = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv: iv },
      key,
      encoder.encode(credentials.passphrase)
    );
    passphraseEncrypted = base64Encode(new Uint8Array(encryptPassphrase));
  }
  
  return {
    apiKeyEncrypted: base64Encode(new Uint8Array(encryptApiKey)),
    apiSecretEncrypted: base64Encode(new Uint8Array(encryptApiSecret)),
    passphraseEncrypted,
    iv: base64Encode(iv),
    salt: base64Encode(salt)
  };
}

// Decrypt exchange credentials
export async function decryptCredentials(data: {
  apiKeyEncrypted: string;
  apiSecretEncrypted: string;
  passphraseEncrypted?: string;
  iv: string;
  salt: string;
}): Promise<{
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
}> {
  const masterKey = getMasterKey();
  const decoder = new TextDecoder();
  
  const iv = base64Decode(data.iv);
  const salt = base64Decode(data.salt);
  const key = await deriveKey(masterKey, salt);
  
  const decryptedApiKey = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: iv },
    key,
    base64Decode(data.apiKeyEncrypted)
  );
  
  const decryptedApiSecret = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: iv },
    key,
    base64Decode(data.apiSecretEncrypted)
  );
  
  let passphrase: string | undefined;
  if (data.passphraseEncrypted) {
    const decryptedPassphrase = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv: iv },
      key,
      base64Decode(data.passphraseEncrypted)
    );
    passphrase = decoder.decode(decryptedPassphrase);
  }
  
  return {
    apiKey: decoder.decode(decryptedApiKey),
    apiSecret: decoder.decode(decryptedApiSecret),
    passphrase
  };
}

// Validate encryption is working
export async function validateEncryption(): Promise<boolean> {
  try {
    const testData = 'test-encryption-validation';
    const { encrypted, iv, salt } = await encrypt(testData);
    const decrypted = await decrypt(encrypted, iv, salt);
    return decrypted === testData;
  } catch {
    return false;
  }
}
