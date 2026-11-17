import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';

const key = 'jianzhang-pin-v1';
type PinRecord = { salt: string; hash: string; attempts: number; lockUntil: number };
let active = false;
export const hasPin = async () => !!(await SecureStore.getItemAsync(key));
async function derive(pin: string, salt: string) {
  return bytesToHex(await pbkdf2Async(sha256, pin, salt, { c: 210000, dkLen: 32, asyncTick: 20 }));
}
export async function setPin(pin: string, confirmation: string) {
  if (!/^\d{6}$/.test(pin) || pin !== confirmation) throw new Error('请输入两次相同的6位数字密码');
  const salt = bytesToHex(Crypto.getRandomBytes(32));
  const record: PinRecord = { salt, hash: await derive(pin, salt), attempts: 0, lockUntil: 0 };
  await SecureStore.setItemAsync(key, JSON.stringify(record));
}
export async function verifyPin(pin: string) {
  if (active) throw new Error('正在验证，请稍候');
  active = true;
  try {
    const raw = await SecureStore.getItemAsync(key);
    if (!raw) throw new Error('尚未设置PIN');
    const record: PinRecord = JSON.parse(raw);
    if (Date.now() < record.lockUntil)
      throw new Error(
        `错误次数过多，请${Math.ceil((record.lockUntil - Date.now()) / 1000)}秒后重试`
      );
    if (!/^\d{6}$/.test(pin)) throw new Error('请输入6位数字密码');
    const hash = await derive(pin, record.salt);
    let difference = hash.length ^ record.hash.length;
    for (let i = 0; i < Math.max(hash.length, record.hash.length); i++)
      difference |= (hash.charCodeAt(i) || 0) ^ (record.hash.charCodeAt(i) || 0);
    if (difference) {
      record.attempts++;
      if (record.attempts >= 5)
        record.lockUntil =
          Date.now() + Math.min(300000, 30000 * 2 ** Math.min(4, record.attempts - 5));
      await SecureStore.setItemAsync(key, JSON.stringify(record));
      throw new Error('密码不正确');
    }
    await SecureStore.setItemAsync(key, JSON.stringify({ ...record, attempts: 0, lockUntil: 0 }));
  } finally {
    active = false;
  }
}
export const removePin = () => SecureStore.deleteItemAsync(key);
