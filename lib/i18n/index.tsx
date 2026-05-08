/* eslint-disable react-refresh/only-export-components */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import { resources } from './resources';
import { getLanguage } from './utils';

export * from './utils';

function detectDeviceLocale(): string | undefined {
  try {
    const mod = require('expo-localization');
    return mod.getLocales?.()[0]?.languageTag;
  } catch {
    return undefined;
  }
}

const savedLang = getLanguage() || detectDeviceLocale() || 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang,
  fallbackLng: 'en',
  compatibilityJSON: 'v4',
  interpolation: {
    escapeValue: false,
  },
});

// Is it a RTL language?
export const isRTL: boolean = i18n.dir() === 'rtl';

try {
  I18nManager.allowRTL(isRTL);
  I18nManager.forceRTL(isRTL);
} catch {
  // server-side
}

export default i18n;
