import { AES, Utf8, Base64, CBC, Pkcs7, MD5, SHA256, HmacSHA256 } from 'crypto-es';
import * as ExpoCrypto from 'expo-crypto';
import JSEncrypt from 'jsencrypt';

// ─── AES 对称加密 ──────────────────────────────────────
const AES_KEY = process.env.EXPO_PUBLIC_AES_KEY ?? '==BallCat-Auth==';

function getAesKeyAndIv() {
  const key = Utf8.parse(AES_KEY);
  const iv = Utf8.parse(AES_KEY.substring(0, 16));
  return { key, iv };
}

export function aesEncrypt(plainText: string): string {
  const { key, iv } = getAesKeyAndIv();
  const encrypted = AES.encrypt(plainText, key, {
    iv,
    mode: CBC,
    padding: Pkcs7,
  });
  return encrypted.toString();
}

export function aesDecrypt(cipherText: string): string {
  const { key, iv } = getAesKeyAndIv();
  const decrypted = AES.decrypt(cipherText, key, {
    iv,
    mode: CBC,
    padding: Pkcs7,
  });
  return decrypted.toString(Utf8);
}

// ─── 哈希 ──────────────────────────────────────────────

export function md5(text: string): string {
  return MD5(text).toString();
}

export function sha256(text: string): string {
  return SHA256(text).toString();
}

export async function sha256Native(text: string): Promise<string> {
  return ExpoCrypto.digestStringAsync(
    ExpoCrypto.CryptoDigestAlgorithm.SHA256,
    text,
  );
}

// ─── Base64 ────────────────────────────────────────────

export function base64Encode(text: string): string {
  return Base64.stringify(Utf8.parse(text));
}

export function base64Decode(encoded: string): string {
  return Base64.parse(encoded).toString(Utf8);
}

// ─── HMAC 签名 ─────────────────────────────────────────

export function hmacSHA256(message: string, secret: string): string {
  return HmacSHA256(message, secret).toString();
}

// ─── 随机数 ─────────────────────────────────────────────

export function randomUUID(): string {
  return ExpoCrypto.randomUUID();
}

export function randomBytes(size: number): Uint8Array {
  return ExpoCrypto.getRandomBytes(size);
}

// ─── 接口签名 ──────────────────────────────────────────

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

// ─── RSA 非对称加密 ────────────────────────────────────────

const RSA_PUBLIC_KEY = process.env.EXPO_PUBLIC_RSA_KEY ?? '';

export function rsaEncrypt(plainText: string, publicKey?: string): string | false {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey ?? RSA_PUBLIC_KEY);
  return encryptor.encrypt(plainText);
}

// ─── 密码加密（登录场景）─────────────────────────────────

export function encryptPassword(password: string, publicKey?: string): string {
  const result = rsaEncrypt(password, publicKey);
  if (!result) {
    throw new Error('RSA encryption failed, check the public key');
  }
  return result;
}
