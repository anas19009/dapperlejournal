import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getKey(): Buffer {
  const secret = process.env.LLM_KEY_ENCRYPTION_SECRET
  if (!secret || Buffer.byteLength(secret, 'utf8') !== 32) {
    throw new Error('LLM_KEY_ENCRYPTION_SECRET must be exactly 32 bytes when UTF-8 encoded')
  }
  return Buffer.from(secret, 'utf8')
}
export function encryptSecret(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(12)                     
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()
  return [
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':')
}
export function decryptSecret(ciphertext: string): string {
  const key = getKey()
  const [ivB64, authTagB64, encryptedB64] = ciphertext.split(':')
  if (!ivB64 || !authTagB64 || !encryptedB64) {
    throw new Error('Invalid ciphertext format')
  }
  const iv = Buffer.from(ivB64, 'base64')
  const authTag = Buffer.from(authTagB64, 'base64')
  const encrypted = Buffer.from(encryptedB64, 'base64')
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString('utf8')
}
