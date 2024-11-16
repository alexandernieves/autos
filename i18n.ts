// i18n.ts
import i18n from 'i18next';  // Importa i18next
import { initReactI18next } from 'react-i18next';  // Importa el inicializador de react-i18next
import en from './locales/en.json';  // Archivos de traducción
import es from './locales/es.json';  // Archivos de traducción
import 'intl-pluralrules';  // Importa el polyfill si es necesario

// Inicialización de i18next
i18n
  .use(initReactI18next)  // Se conecta con react-i18next
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    lng: 'en',  // Idioma predeterminado
    fallbackLng: 'en',  // Idioma de respaldo
    interpolation: {
      escapeValue: false,  // No necesitamos escapar los valores
    },
  });

export default i18n;
