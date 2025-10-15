import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || randomBytes(32);
const ALGORITHM = 'aes-256-gcm';

export function encryptApiKey(apiKey: string): { encrypted: string; iv: string } {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(apiKey, 'utf8'),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();

  return {
    encrypted: Buffer.concat([encrypted, tag]).toString('base64'),
    iv: iv.toString('base64')
  };
}

export function decryptApiKey(encrypted: string, iv: string): string {
  const decipher = createDecipheriv(
    ALGORITHM,
    ENCRYPTION_KEY,
    Buffer.from(iv, 'base64')
  );

  const encryptedBuffer = Buffer.from(encrypted, 'base64');
  const tag = encryptedBuffer.slice(-16);
  const data = encryptedBuffer.slice(0, -16);

  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(data),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
}