import { useTranslation } from "react-i18next";

import styles from "./LanguageSwitcher.module.css";

const LANGUAGES = [
  {
    code: "es",
    label: "ES",
    name: "Español",
  },
  {
    code: "en",
    label: "EN",
    name: "English",
  },
];

function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  const currentLanguage = i18n.resolvedLanguage ?? i18n.language;

  // Cambia el idioma sin recargar la página.
  const handleLanguageChange = (language) => {
    if (currentLanguage === language) {
      return;
    }

    void i18n.changeLanguage(language);
  };

  return (
    <div
      className={styles.switcher}
      role="group"
      aria-label={t("common.languageSelector")}
    >
      {LANGUAGES.map((language) => (
        <button
          key={language.code}
          type="button"
          className={`${styles.button} ${
            currentLanguage === language.code ? styles.active : ""
          }`}
          onClick={() => handleLanguageChange(language.code)}
          aria-label={language.name}
          aria-pressed={currentLanguage === language.code}
          title={language.name}
        >
          {language.label}
        </button>
      ))}
    </div>
  );
}

export default LanguageSwitcher;
