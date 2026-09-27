import i18n from "i18next";

import { initReactI18next } from "react-i18next";

import es from "./locales/es.json";
import en from "./locales/en.json";

// Clave utilizada para recordar el idioma elegido.
const LANGUAGE_STORAGE_KEY = "vulntrack-language";

// Español por defecto.
// Solo utilizamos inglés si el usuario lo seleccionó previamente.
const getInitialLanguage = () => {
  try {
    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

    return savedLanguage === "en" ? "en" : "es";
  } catch {
    return "es";
  }
};

const initialLanguage = getInitialLanguage();

// Actualiza el idioma y el título del documento.
const applyDocumentLanguage = (language) => {
  document.documentElement.lang = language;

  document.title =
    language === "en"
      ? "VulnTrack | Vulnerability Management"
      : "VulnTrack | Gestión de vulnerabilidades";

  // Conserva la preferencia del usuario.
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // La aplicación continúa funcionando aunque
    // localStorage no esté disponible.
  }
};

// Ejecutamos esta función cuando cambia el idioma.
i18n.on("languageChanged", applyDocumentLanguage);

// Inicializamos las traducciones.
i18n.use(initReactI18next).init({
  resources: {
    es: {
      translation: es,
    },

    en: {
      translation: en,
    },
  },

  lng: initialLanguage,

  fallbackLng: "es",

  supportedLngs: ["es", "en"],

  // Las traducciones ya están incluidas localmente.
  initImmediate: false,

  interpolation: {
    escapeValue: false,
  },
});

// Garantiza que el HTML tenga el idioma inicial correcto.
applyDocumentLanguage(initialLanguage);

export default i18n;
