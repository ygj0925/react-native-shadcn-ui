import CryptoES from 'crypto-es';
import * as ExpoCrypto from 'expo-crypto';

// ─── AES 对称加密 ──────────────────────────────────────
// 密钥由后端约定，建议通过环境变量注入
const AES_KEY = process.env.EXPO_PUBLIC_AES_KEY ?? 'default-aes-key-16';

const key = CryptoES.enc.Utf8.parse(AES_KEY);
const iv = CryptoES.enc.Utf8.parse(AES_KEY.substring(0, 16));

export function aesEncrypt(plainText: string): string {
  const encrypted = CryptoES.AES.encrypt(plainText, key, {
    iv,
    mode: CryptoES.mode.CBC,
    padding: CryptoES.pad.Pkcs7,
  });
  return encrypted.toString();
}

export function aesDecrypt(cipherText: string): string {
  const decrypted = CryptoES.AES.decrypt(cipherText, key, {
    iv,
    mode: CryptoES.mode.CBC,
    padding: CryptoES.pad.Pkcs7,
  });
  return decrypted.toString(CryptoES.enc.Utf8);
}

// ─── 哈希 ──────────────────────────────────────────────

export function md5(text: string): string {
  return CryptoES.MD5(text).toString();
}

export function sha256(text: string): string {
  return CryptoES.SHA256(text).toString();
}

export async function sha256Native(text: string): Promise<string> {
  return ExpoCrypto.digestStringAsync(
    ExpoCrypto.CryptoDigestAlgorithm.SHA256,
    text,
  );
}

// ─── Base64 ────────────────────────────────────────────

export function base64Encode(text: string): string {
  return CryptoES.enc.Base64.stringify(CryptoES.enc.Utf8.parse(text));
}

export function base64Decode(encoded: string): string {
  return CryptoES.enc.Base64.parse(encoded).toString(CryptoES.enc.Utf8);
}

// ─── HMAC 签名 ─────────────────────────────────────────

export function hmacSHA256(message: string, secret: string): string {
  return CryptoES.HmacSHA256(message, secret).toString();
}

// ─── 随机数 ─────────────────────────────────────────────

export function randomUUID(): string {
  return ExpoCrypto.randomUUID();
}

export function randomBytes(size: number): Uint8Array {
  return ExpoCrypto.getRandomBytes(size);
}

// ─── 接口签名 ──────────────────────────────────────────
// 将请求参数按key排序拼接后HMAC签名，防止请求被篡改

export function signRequest(
  params: Record<string, any>,
  secret: string,
  timestamp?: number,
): string {
  const ts = timestamp ?? Date.now();
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  const raw = `${sorted}&timestamp=${ts}`;
  return hmacSHA256(raw, secret);
}

// ─── 密码加密（登录场景）─────────────────────────────────
// md5(password) + AES加密，双重保护

export function encryptPassword(password: string): string {
  const hashed = md5(password);
  return aesEncrypt(hashed);
}
