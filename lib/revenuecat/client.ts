import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';

// Configure these values from environment variables or a config file.
// For Expo, use expo-constants or process.env.EXPO_PUBLIC_*.
const REVENUECAT_API_KEY =
  Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? ''
    : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? '';

let isConfigured = false;

export function configureRevenueCat(userId?: string) {
  if (isConfigured) return;
  if (!REVENUECAT_API_KEY) {
    console.warn('[RevenueCat] API key not configured');
    return;
  }

  Purchases.setLogLevel(LOG_LEVEL.INFO);
  Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: userId });
  isConfigured = true;
}

export function setRevenueCatUserId(userId: string) {
  if (!isConfigured) return;
  Purchases.logIn(userId).catch((err) => {
    console.warn('[RevenueCat] logIn failed:', err.message);
  });
}

export function logoutRevenueCat() {
  if (!isConfigured) return;
  Purchases.logOut().catch((err) => {
    console.warn('[RevenueCat] logOut failed:', err.message);
  });
}

export async function getOfferings() {
  if (!isConfigured) return null;
  try {
    return await Purchases.getOfferings();
  } catch (err: any) {
    console.warn('[RevenueCat] getOfferings failed:', err.message);
    return null;
  }
}

export async function getCustomerInfo() {
  if (!isConfigured) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch (err: any) {
    console.warn('[RevenueCat] getCustomerInfo failed:', err.message);
    return null;
  }
}

export async function purchasePackage(packageToPurchase: any) {
  if (!isConfigured) throw new Error('RevenueCat not configured');
  return Purchases.purchasePackage(packageToPurchase);
}

export async function restorePurchases() {
  if (!isConfigured) return null;
  return Purchases.restorePurchases();
}

export { Purchases };
