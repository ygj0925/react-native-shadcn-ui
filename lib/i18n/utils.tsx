import type { TOptions } from 'i18next';
import type { Language, resources } from './resources';
import type { RecursiveKeyOf } from './types';
import i18n from 'i18next';
import memoize from 'lodash.memoize';
import { useCallback, useState } from 'react';

import { storage } from '../storage';

type DefaultLocale = typeof resources.en.translation;
export type TxKeyPath = RecursiveKeyOf<DefaultLocale>;

export const LOCAL = 'local';

export const getLanguage = () => storage.getString(LOCAL);

export const translate = memoize(
  (key: TxKeyPath, options?: TOptions) => i18n.t(key, options) as unknown as string,
  (key: TxKeyPath, options?: TOptions) => (options ? key + JSON.stringify(options) : key)
);

export function changeLanguage(lang: Language) {
  i18n.changeLanguage(lang);
}

export function useSelectedLanguage() {
  const [language, setLanguageState] = useState<Language | undefined>(
    () => storage.getString(LOCAL) as Language | undefined
  );

  const setLanguage = useCallback((lang: Language) => {
    storage.set(LOCAL, lang);
    setLanguageState(lang);
    changeLanguage(lang);
  }, []);

  return { language, setLanguage };
}
