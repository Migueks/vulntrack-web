import {
  Activity,
  Database,
  LogOut,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { apiRequest } from "../../api/apiClient";
import LanguageSwitcher from "../../components/common/LanguageSwitcher/LanguageSwitcher";
import { useAuth } from "../../context/useAuth";

import styles from "./Dashboard.module.css";

// Indicadores principales del Dashboard.
const STATS = [
  {
    key: "totalFindings",
    icon: ShieldCheck,
  },
  {
    key: "activeFindings",
    icon: Activity,
  },
  {
    key: "overdueFindings",
    icon: TriangleAlert,
    danger: true,
  },
  {
    key: "totalAssets",
    icon: Database,
  },
];

function Dashboard() {
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  const { user, logout } = useAuth();

  // Consulta las estadísticas reales de MongoDB Atlas.
  const { data, isPending, isError } = useQuery({
    queryKey: ["dashboard", "overview"],

    queryFn: () => apiRequest("/dashboard/overview"),

    retry: false,

    staleTime: 30_000,
  });

  // Formatea los números según el idioma seleccionado.
  const formatNumber = (value) =>
    new Intl.NumberFormat(
      i18n.resolvedLanguage === "en" ? "en-GB" : "es-ES",
    ).format(value ?? 0);

  // Cierra sesión y vuelve al Login.
  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <main className={styles.page}>
      {/* Cabecera */}

      <header className={styles.header}>
        <div className={styles.brand}>
          <ShieldCheck size={28} strokeWidth={2} aria-hidden="true" />

          <span>
            VULNTRACK<span>.</span>
          </span>
        </div>

        <div className={styles.actions}>
          <LanguageSwitcher />

          <button
            type="button"
            className={styles.logout}
            onClick={handleLogout}
          >
            <LogOut size={17} aria-hidden="true" />

            <span>{t("dashboard.logout")}</span>
          </button>
        </div>
      </header>

      {/* Contenido */}

      <section className={styles.content}>
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>
              <Activity size={16} aria-hidden="true" />

              {t("dashboard.securityOverview")}
            </span>

            <h1>
              {t("dashboard.welcome", {
                name: user?.name,
              })}
            </h1>

            <p>{t("dashboard.subtitle")}</p>
          </div>

          <span className={styles.role}>{user?.role}</span>
        </div>

        {/* Estado de carga */}

        {isPending && (
          <p className={styles.message} role="status">
            {t("dashboard.loading")}
          </p>
        )}

        {/* Error de la API */}

        {isError && (
          <div className={styles.error} role="alert">
            {t("errors.dashboard")}
          </div>
        )}

        {/* Indicadores reales */}

        {data && (
          <div className={styles.stats}>
            {STATS.map((stat) => {
              const Icon = stat.icon;

              return (
                <article key={stat.key} className={styles.stat}>
                  <div className={styles.statHeader}>
                    <span>{t(`dashboard.${stat.key}`)}</span>

                    <Icon size={19} aria-hidden="true" />
                  </div>

                  <strong className={stat.danger ? styles.danger : undefined}>
                    {formatNumber(data.summary[stat.key])}
                  </strong>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default Dashboard;
