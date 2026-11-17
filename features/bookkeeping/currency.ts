export type OriginalAmount = { currency: string; cents: number; rateMicros: number };
export const currencies = ['USD', 'EUR', 'HKD', 'JPY', 'GBP', 'AUD', 'CAD', 'SGD'] as const;
export function parseRate(text: string): number {
  if (!/^\d{1,6}(\.\d{1,6})?$/.test(text.trim())) throw new Error('汇率最多6位整数和6位小数');
  const [whole, fraction = ''] = text.trim().split('.');
  const value = Number(whole) * 1000000 + Number(fraction.padEnd(6, '0'));
  if (value <= 0) throw new Error('汇率必须大于0');
  return value;
}
export function convertedCents(original: OriginalAmount): number {
  if (
    !(currencies as readonly string[]).includes(original.currency) ||
    !Number.isSafeInteger(original.cents) ||
    original.cents <= 0 ||
    !Number.isSafeInteger(original.rateMicros) ||
    original.rateMicros <= 0
  )
    throw new Error('原币金额或汇率无效');
  const result = (BigInt(original.cents) * BigInt(original.rateMicros) + 500000n) / 1000000n;
  if (result < 1n || result > 99999999999n) throw new Error('折算金额不足0.01元或超出上限');
  return Number(result);
}
