import { ArrowLeft, Database, Server, ShieldAlert } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { getAssetById } from "../../api/assetsApi";
import { getFindings } from "../../api/findingsApi";
import AppLayout from "../../components/layout/AppLayout";

import styles from "./AssetDetail.module.css";

function AssetDetail() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  // Recupera los datos principales del activo seleccionado.
  const {
    data: asset,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["asset", id],
    queryFn: () => getAssetById(id),
    enabled: Boolean(id),
  });

  // Recupera los últimos hallazgos relacionados con este activo.
  const {
    data: findingsData,
    isPending: findingsPending,
    isError: findingsError,
  } = useQuery({
    queryKey: ["findings", { assetId: id }],

    queryFn: () =>
      getFindings({
        assetId: id,
        page: 1,
        limit: 5,
        sortBy: "detectedAt",
        order: "desc",
      }),

    enabled: Boolean(id),
  });

  const findings = findingsData?.findings ?? [];
  const totalFindings = findingsData?.pagination?.total ?? findings.length;

  // Formatea las fechas según el idioma activo.
  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      i18n.language === "es" ? "es-ES" : "en-GB",
    );
  };

  return (
    <AppLayout>
      <button
        type="button"
        className={styles.backButton}
        onClick={() => navigate("/assets")}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {t("assetDetail.back")}
      </button>

      {isPending && (
        <div className={styles.message} role="status">
          {t("assetDetail.loading")}
        </div>
      )}

      {isError && (
        <div className={styles.error} role="alert">
          {t("assetDetail.error")}
        </div>
      )}

      {asset && (
        <>
          {/* Encabezado del activo */}

          <div className={styles.heading}>
            <div>
              <span className={styles.eyebrow}>
                <Database size={16} aria-hidden="true" />
                {asset.assetCode}
              </span>

              <h1>{asset.name}</h1>

              <p>{asset.description || t("assetDetail.noDescription")}</p>
            </div>

            <span className={styles.statusBadge} data-status={asset.status}>
              {t(`assetStatus.${asset.status}`)}
            </span>
          </div>

          {/* Información técnica */}

          <section className={styles.card}>
            <div className={styles.cardTitle}>
              <Server size={18} aria-hidden="true" />
              <h2>{t("assetDetail.information")}</h2>
            </div>

            <div className={styles.grid}>
              <div>
                <span>{t("assets.type")}</span>
                <strong>{t(`assetType.${asset.type}`)}</strong>
              </div>

              <div>
                <span>{t("assets.criticality")}</span>
                <strong>{t(`assetCriticality.${asset.criticality}`)}</strong>
              </div>

              <div>
                <span>{t("assetDetail.hostname")}</span>
                <strong>{asset.hostname || "—"}</strong>
              </div>

              <div>
                <span>{t("assetDetail.ip")}</span>
                <strong>{asset.ipAddress || "—"}</strong>
              </div>

              <div>
                <span>{t("assetDetail.os")}</span>
                <strong>{asset.operatingSystem || "—"}</strong>
              </div>

              <div>
                <span>{t("assetDetail.environment")}</span>
                <strong>
                  {asset.environment
                    ? t(`assetEnvironment.${asset.environment}`)
                    : "—"}
                </strong>
              </div>

              <div>
                <span>{t("assetDetail.department")}</span>
                <strong>{asset.department || "—"}</strong>
              </div>

              <div>
                <span>{t("assetDetail.createdBy")}</span>
                <strong>{asset.createdBy?.name || "—"}</strong>
              </div>
            </div>
          </section>

          {/* Hallazgos relacionados */}

          <section className={`${styles.card} ${styles.findingsCard}`}>
            <div className={styles.findingsHeader}>
              <div className={styles.cardTitle}>
                <ShieldAlert size={18} aria-hidden="true" />

                <div>
                  <h2>{t("assetDetail.relatedFindings")}</h2>

                  <p>
                    {t("assetDetail.relatedFindingsDescription", {
                      count: totalFindings,
                    })}
                  </p>
                </div>
              </div>
            </div>

            {findingsPending && (
              <div className={styles.message}>
                {t("assetDetail.findingsLoading")}
              </div>
            )}

            {findingsError && (
              <div className={styles.error}>
                {t("assetDetail.findingsError")}
              </div>
            )}

            {!findingsPending && !findingsError && findings.length === 0 && (
              <div className={styles.empty}>{t("assetDetail.noFindings")}</div>
            )}

            {!findingsPending && !findingsError && findings.length > 0 && (
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t("assetDetail.findingCode")}</th>
                      <th>{t("assetDetail.vulnerability")}</th>
                      <th>{t("assetDetail.priority")}</th>
                      <th>{t("assetDetail.findingStatus")}</th>
                      <th>{t("assetDetail.dueDate")}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {findings.map((finding) => (
                      <tr key={finding.id}>
                        <td className={styles.code}>{finding.findingCode}</td>

                        <td>{finding.vulnerability?.title ?? "—"}</td>

                        <td>
                          <span
                            className={styles.priorityBadge}
                            data-priority={finding.priority}
                          >
                            {finding.priority}
                          </span>
                        </td>

                        <td>{t(`findingStatus.${finding.status}`)}</td>

                        <td>{formatDate(finding.dueDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </AppLayout>
  );
}

export default AssetDetail;
