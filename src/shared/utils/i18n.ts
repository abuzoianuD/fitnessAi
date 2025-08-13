import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../locales/en.json";

// Simplified i18n configuration with English as default
i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: "v4",
    fallbackLng: "en",
    debug: false,
    lng: "en",
    resources: {
      en: { translation: en },
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
