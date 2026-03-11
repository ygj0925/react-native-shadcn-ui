import zh from '@/translations/zh.json';
import en from '@/translations/en.json';

export const resources = {
  en: {
    translation: en,
  },
  zh: {
    translation: zh,
  },
};

export type Language = keyof typeof resources;
