import { ArrowLeft, ShieldAlert } from "lucide-react";

import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../context/useAuth";

import styles from "./NotFound.module.css";

function NotFound() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  // Los usuarios autenticados vuelven al panel; el resto, al inicio público.
  const destination = isAuthenticated ? "/dashboard" : "/";

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.icon}>
          <ShieldAlert size={36} strokeWidth={1.8} aria-hidden="true" />
        </div>

        <span className={styles.code}>404</span>

        <h1>{t("notFound.title")}</h1>

        <p>{t("notFound.description")}</p>

        <Link to={destination} className={styles.button}>
          <ArrowLeft size={17} aria-hidden="true" />

          {isAuthenticated ? t("notFound.dashboard") : t("notFound.home")}
        </Link>
      </section>
    </main>
  );
}

export default NotFound;
