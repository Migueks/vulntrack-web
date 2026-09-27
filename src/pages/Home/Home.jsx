import { Activity, Database, LockKeyhole, ShieldCheck } from "lucide-react";

import { useTranslation } from "react-i18next";

import { Link } from "react-router";

import LanguageSwitcher from "../../components/common/LanguageSwitcher/LanguageSwitcher";

import styles from "./Home.module.css";

// Módulos mostrados en la página de presentación.
const MODULES = [
  {
    icon: Database,
    key: "assets",
  },
  {
    icon: ShieldCheck,
    key: "vulnerabilities",
  },
  {
    icon: Activity,
    key: "analytics",
  },
];

function Home() {
  const { t } = useTranslation();

  return (
    <main className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.container}>
        {/* Cabecera */}

        <header className={styles.header}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>
              <ShieldCheck strokeWidth={2.2} aria-hidden="true" />
            </div>

            <span className={styles.brandName}>
              VULNTRACK<span>.</span>
            </span>
          </div>

          <div className={styles.headerActions}>
            <span className={styles.headerTag}>
              {t("header.securityOperations")}
            </span>

            <Link to="/login" className={styles.headerLoginLink}>
              {t("home.login")}
            </Link>

            <LanguageSwitcher />
          </div>
        </header>

        {/* Presentación */}

        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowDot} aria-hidden="true" />

              {t("hero.eyebrow")}
            </span>

            <h1 className={styles.title}>
              {t("hero.titleFirst")}

              <br />

              <span>{t("hero.titleAccent")}</span>
            </h1>

            <p className={styles.description}>{t("hero.description")}</p>

            <div className={styles.techTags}>
              <span>REACT</span>
              <span>EXPRESS</span>
              <span>MONGODB</span>
              <span>CLOUDINARY</span>
            </div>
          </div>

          {/* Panel de módulos */}

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelLabel}>{t("modules.title")}</span>

              <LockKeyhole
                className={styles.panelHeaderIcon}
                aria-hidden="true"
              />
            </div>

            <div className={styles.moduleList}>
              {MODULES.map((module) => {
                const Icon = module.icon;

                return (
                  <div className={styles.module} key={module.key}>
                    <div className={styles.moduleIcon}>
                      <Icon strokeWidth={1.8} aria-hidden="true" />
                    </div>

                    <div className={styles.moduleContent}>
                      <h2>{t(`modules.${module.key}.title`)}</h2>

                      <p>{t(`modules.${module.key}.description`)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.panelFooter}>
              <span className={styles.footerDot} aria-hidden="true" />

              {t("status.initialized")}
            </div>
          </div>
        </section>

        {/* Pie de página */}

        <footer className={styles.footer}>
          <span>VULNTRACK © 2026</span>

          <span>{t("footer.tagline")}</span>
        </footer>
      </div>
    </main>
  );
}

export default Home;
