import {
  Activity,
  Bug,
  Database,
  ShieldCheck,
  TriangleAlert,
  UserX,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { apiRequest } from "../../api/apiClient";
import AppLayout from "../../components/layout/AppLayout";
import { useAuth } from "../../context/useAuth";

import DashboardCharts from "./DashboardCharts";
import DashboardActivity from "./DashboardActivity";

import styles from "./Dashboard.module.css";

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
  {
    key: "totalVulnerabilities",
    icon: Bug,
  },
  {
    key: "unassignedFindings",
    icon: UserX,
  },
];

function Dashboard() {
  const { t, i18n } = useTranslation();

  const { user } = useAuth();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["dashboard", "overview"],

    queryFn: () => apiRequest("/dashboard/overview"),

    retry: false,

    staleTime: 30_000,
  });

  const locale = i18n.resolvedLanguage === "en" ? "en-GB" : "es-ES";

  const formatNumber = (value) =>
    new Intl.NumberFormat(locale).format(value ?? 0);

  return (
    <AppLayout>
      {/* Encabezado */}

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

        <span className={styles.role}>
          {t(`roles.${user?.role}`, {
            defaultValue: user?.role ?? "",
          })}
        </span>
      </div>

      {/* Carga */}

      {isPending && (
        <p className={styles.message} role="status">
          {t("dashboard.loading")}
        </p>
      )}

      {/* Error */}

      {isError && (
        <div className={styles.error} role="alert">
          <p>{t("errors.dashboard")}</p>

          <button type="button" onClick={() => void refetch()}>
            {t("common.retry")}
          </button>
        </div>
      )}

      {/* Datos reales */}

      {data?.summary && (
        <>
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

          <DashboardCharts overview={data} />

          <DashboardActivity overview={data} />
        </>
      )}
    </AppLayout>
  );
}

export default Dashboard;
