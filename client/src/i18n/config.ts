import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './translations/en.json';
import esARTranslations from './translations/es-AR.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: enTranslations,
    },
    'es-AR': {
      translation: esARTranslations,
    },
  },
  lng: 'es-AR', 
  fallbackLng: 'es-AR',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;