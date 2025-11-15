import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

declare const process: {
  env: {
    NODE_ENV: string;
  };
};

import en from '../locales/en.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import hi from '../locales/hi.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  hi: { translation: hi },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,

    // Get user language preference from localStorage
    lng: localStorage.getItem('selected_language') || 'en',

    fallbackLng: 'en',

    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'selected_language',
    },

    interpolation: {
      escapeValue: false, // React already escapes by default
    },

    // Enable debug in development
    debug: process.env.NODE_ENV === 'development',
  });

// Save language change to localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('selected_language', lng);
});

export default i18n;
