/* eslint-disable react-refresh/only-export-components */
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import { resources } from './resources';
import { getLanguage } from './utils';

export * from './utils';

let savedLang: string | undefined;
try {
  savedLang = getLanguage() || getLocales()[0]?.languageTag;
} catch {
  savedLang = 'en';
}

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
