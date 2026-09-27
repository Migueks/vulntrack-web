import { useTranslation } from "react-i18next";

import styles from "./DashboardActivity.module.css";

const getLocale = (language) => (language === "en" ? "en-GB" : "es-ES");

function DashboardActivity({ overview }) {
  const { t, i18n } = useTranslation();

  const locale = getLocale(i18n.resolvedLanguage);

  const formatNumber = (value) =>
    new Intl.NumberFormat(locale).format(value ?? 0);

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const topAssets = overview.topAffectedAssets ?? [];
  const recentFindings = overview.recentFindings ?? [];

  // La barra representa el número de hallazgos
  // respecto al activo con más hallazgos de esta lista.
  const maxFindings = Math.max(
    1,
    ...topAssets.map((asset) => asset.activeFindings),
  );

  return (
    <section
      className={styles.section}
      aria-labelledby="dashboard-activity-title"
    >
      <div className={styles.sectionHeading}>
        <span className={styles.eyebrow}>{t("activity.eyebrow")}</span>

        <h2 id="dashboard-activity-title">{t("activity.title")}</h2>

        <p>{t("activity.description")}</p>
      </div>

      <div className={styles.grid}>
        {/* Activos más afectados */}

        <article className={styles.card}>
          <div className={styles.cardHeading}>
            <h3>{t("activity.topAssetsTitle")}</h3>

            <p>{t("activity.topAssetsDescription")}</p>
          </div>

          {topAssets.length === 0 ? (
            <p className={styles.empty}>{t("activity.noAssets")}</p>
          ) : (
            <ol className={styles.assetList}>
              {topAssets.map((asset) => (
                <li key={asset.id} className={styles.assetItem}>
                  <div className={styles.assetHeader}>
                    <div className={styles.assetIdentity}>
                      <span className={styles.assetCode}>
                        {asset.assetCode}
                      </span>

                      <strong title={asset.name}>{asset.name}</strong>
                    </div>

                    <strong className={styles.assetCount}>
                      {formatNumber(asset.activeFindings)}
                    </strong>
                  </div>

                  <div className={styles.assetMetadata}>
                    <span
                      className={styles.criticality}
                      data-criticality={asset.criticality}
                    >
                      {t(`assetCriticality.${asset.criticality}`, {
                        defaultValue: asset.criticality,
                      })}
                    </span>

                    <span>{t("activity.activeFindings")}</span>
                  </div>

                  <div
                    className={styles.barTrack}
                    role="img"
                    aria-label={t("activity.assetBarLabel", {
                      name: asset.name,
                      count: asset.activeFindings,
                    })}
                  >
                    <div
                      className={styles.barFill}
                      style={{
                        width: `${(asset.activeFindings / maxFindings) * 100}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ol>
          )}
        </article>

        {/* Hallazgos recientes */}

        <article className={`${styles.card} ${styles.recentCard}`}>
          <div className={styles.cardHeading}>
            <h3>{t("activity.recentTitle")}</h3>

            <p>{t("activity.recentDescription")}</p>
          </div>

          {recentFindings.length === 0 ? (
            <p className={styles.empty}>{t("activity.noFindings")}</p>
          ) : (
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">{t("activity.finding")}</th>

                    <th scope="col">{t("activity.asset")}</th>

                    <th scope="col">{t("activity.priority")}</th>

                    <th scope="col">{t("activity.status")}</th>

                    <th scope="col">{t("activity.assignee")}</th>

                    <th scope="col">{t("activity.detected")}</th>

                    <th scope="col">{t("activity.dueDate")}</th>
                  </tr>
                </thead>

                <tbody>
                  {recentFindings.map((finding) => (
                    <tr key={finding.id}>
                      {/* Hallazgo y vulnerabilidad */}

                      <td>
                        <div className={styles.findingIdentity}>
                          <span className={styles.findingCode}>
                            {finding.findingCode}
                          </span>

                          <strong title={finding.vulnerability?.title ?? ""}>
                            {finding.vulnerability?.title ?? "—"}
                          </strong>
                        </div>
                      </td>

                      {/* Activo relacionado */}

                      <td>
                        <div className={styles.assetIdentity}>
                          <span className={styles.assetCode}>
                            {finding.asset?.assetCode ?? "—"}
                          </span>

                          <span title={finding.asset?.name ?? ""}>
                            {finding.asset?.name ?? "—"}
                          </span>
                        </div>
                      </td>

                      {/* Prioridad */}

                      <td>
                        <span
                          className={styles.priorityBadge}
                          data-priority={finding.priority}
                        >
                          {finding.priority}
                        </span>
                      </td>

                      {/* Estado */}

                      <td>
                        <span
                          className={styles.statusBadge}
                          data-status={finding.status}
                        >
                          {t(`findingStatus.${finding.status}`, {
                            defaultValue: finding.status,
                          })}
                        </span>
                      </td>

                      {/* Responsable */}

                      <td>
                        {finding.assignedTo?.name ?? t("activity.unassigned")}
                      </td>

                      {/* Detección */}

                      <td className={styles.date}>
                        {formatDate(finding.detectedAt)}
                      </td>

                      {/* Vencimiento */}

                      <td className={styles.date}>
                        <div className={styles.dueDateCell}>
                          <span>{formatDate(finding.dueDate)}</span>

                          {finding.overdue && (
                            <span className={styles.overdueBadge}>
                              {t("activity.overdue")}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

export default DashboardActivity;
