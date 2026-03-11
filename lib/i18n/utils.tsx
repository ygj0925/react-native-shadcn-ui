import type { TOptions } from 'i18next';
import type { Language, resources } from './resources';
import type { RecursiveKeyOf } from './types';
import i18n from 'i18next';
import memoize from 'lodash.memoize';
import { useCallback } from 'react';
import { I18nManager, NativeModules, Platform } from 'react-native';

import { useMMKVString } from 'react-native-mmkv';
import RNRestart from 'react-native-restart';
import { storage } from '../storage';

type DefaultLocale = typeof resources.en.translation;
export type TxKeyPath = RecursiveKeyOf<DefaultLocale>;

export const LOCAL = 'local';

export const getLanguage = () => storage.getString(LOCAL);

export const translate = memoize(
  (key: TxKeyPath, options?: TOptions) =>
    i18n.t(key, options) as unknown as string,
  (key: TxKeyPath, options?: TOptions) =>
    options ? key + JSON.stringify(options) : key,
);

export function changeLanguage(lang: Language) {
  i18n.changeLanguage(lang);
  // 如需重启生效，可取消下方注释
  // if (Platform.OS === 'ios' || Platform.OS === 'android') {
  //   if (__DEV__)
  //     NativeModules.DevSettings.reload();
  //   else RNRestart.restart();
  // }
  // else if (Platform.OS === 'web') {
  //   window.location.reload();
  // }
}

export function useSelectedLanguage() {
  const [language, setLang] = useMMKVString(LOCAL);

  const setLanguage = useCallback(
    (lang: Language) => {
      setLang(lang);
      if (lang !== undefined)
        changeLanguage(lang as Language);
    },
    [setLang],
  );

  return { language: language as Language, setLanguage };
}