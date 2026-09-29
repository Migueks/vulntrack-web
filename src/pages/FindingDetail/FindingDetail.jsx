import {
  ArrowLeft,
  ClipboardList,
  FileText,
  History,
  ShieldAlert,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { getFindingById } from "../../api/findingsApi";
import AppLayout from "../../components/layout/AppLayout";

import styles from "./FindingDetail.module.css";

function FindingDetail() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  // Recupera el hallazgo seleccionado con todas sus relaciones.
  const {
    data: finding,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["finding", id],
    queryFn: () => getFindingById(id),
    enabled: Boolean(id),
  });

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
        onClick={() => navigate("/findings")}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {t("findingDetail.back")}
      </button>

      {isPending && (
        <div className={styles.message}>{t("findingDetail.loading")}</div>
      )}

      {isError && (
        <div className={styles.error}>{t("findingDetail.error")}</div>
      )}

      {finding && (
        <>
          {/* Encabezado */}

          <div className={styles.heading}>
            <div>
              <span className={styles.eyebrow}>
                <ClipboardList size={16} aria-hidden="true" />
                {finding.findingCode}
              </span>

              <h1>{finding.vulnerability?.title ?? finding.findingCode}</h1>

              <p>
                {finding.asset?.name ?? "—"} ·{" "}
                {finding.vulnerability?.vulnerabilityCode ?? "—"}
              </p>
            </div>

            <div className={styles.badges}>
              <span
                className={styles.priorityBadge}
                data-priority={finding.priority}
              >
                {finding.priority}
              </span>

              <span className={styles.statusBadge} data-status={finding.status}>
                {t(`findingStatus.${finding.status}`)}
              </span>
            </div>
          </div>

          {/* Información principal */}

          <section className={styles.card}>
            <div className={styles.cardTitle}>
              <ShieldAlert size={18} aria-hidden="true" />
              <h2>{t("findingDetail.information")}</h2>
            </div>

            <div className={styles.grid}>
              <div>
                <span>{t("findingDetail.asset")}</span>
                <strong>{finding.asset?.name ?? "—"}</strong>
              </div>

              <div>
                <span>{t("findingDetail.assetCriticality")}</span>
                <strong>
                  {finding.asset?.criticality
                    ? t(`assetCriticality.${finding.asset.criticality}`)
                    : "—"}
                </strong>
              </div>

              <div>
                <span>{t("findingDetail.vulnerability")}</span>
                <strong>{finding.vulnerability?.title ?? "—"}</strong>
              </div>

              <div>
                <span>{t("findingDetail.severity")}</span>
                <strong>
                  {finding.vulnerability?.severity
                    ? t(
                        `vulnerabilitySeverity.${finding.vulnerability.severity}`,
                      )
                    : "—"}
                </strong>
              </div>

              <div>
                <span>{t("findingDetail.assignedTo")}</span>
                <strong>
                  {finding.assignedTo?.name ?? t("findings.unassigned")}
                </strong>
              </div>

              <div>
                <span>{t("findingDetail.createdBy")}</span>
                <strong>{finding.createdBy?.name ?? "—"}</strong>
              </div>

              <div>
                <span>{t("findingDetail.detectedAt")}</span>
                <strong>{formatDate(finding.detectedAt)}</strong>
              </div>

              <div>
                <span>{t("findingDetail.dueDate")}</span>

                <strong
                  className={finding.overdue ? styles.overdue : undefined}
                >
                  {formatDate(finding.dueDate)}
                </strong>
              </div>

              <div>
                <span>{t("findingDetail.closedAt")}</span>
                <strong>{formatDate(finding.closedAt)}</strong>
              </div>

              <div>
                <span>{t("findingDetail.updatedAt")}</span>
                <strong>{formatDate(finding.updatedAt)}</strong>
              </div>
            </div>

            {finding.closureNote && (
              <div className={styles.closure}>
                <span>{t("findingDetail.closureNote")}</span>
                <p>{finding.closureNote}</p>
              </div>
            )}
          </section>

          {/* Evidencias */}

          <section className={`${styles.card} ${styles.section}`}>
            <div className={styles.cardTitle}>
              <FileText size={18} aria-hidden="true" />

              <div>
                <h2>{t("findingDetail.evidence")}</h2>
                <p>
                  {t("findingDetail.evidenceCount", {
                    count: finding.evidence?.length ?? 0,
                  })}
                </p>
              </div>
            </div>

            {finding.evidence?.length ? (
              <div className={styles.evidenceList}>
                {finding.evidence.map((item) => (
                  <div key={item.id} className={styles.evidenceItem}>
                    <FileText size={16} aria-hidden="true" />

                    <div>
                      <strong>{item.originalName}</strong>
                      <span>
                        {item.uploadedBy?.name ?? "—"} ·{" "}
                        {formatDate(item.uploadedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.empty}>{t("findingDetail.noEvidence")}</p>
            )}
          </section>

          {/* Historial */}

          <section className={`${styles.card} ${styles.section}`}>
            <div className={styles.cardTitle}>
              <History size={18} aria-hidden="true" />
              <h2>{t("findingDetail.history")}</h2>
            </div>

            {finding.history?.length ? (
              <div className={styles.history}>
                {[...finding.history].reverse().map((item) => (
                  <div key={item.id} className={styles.historyItem}>
                    <span className={styles.historyDot} />

                    <div>
                      <strong>{t(`findingHistory.${item.action}`)}</strong>

                      <p>
                        {item.performedBy?.name ?? "—"} ·{" "}
                        {formatDate(item.date)}
                      </p>

                      {item.note && <p>{item.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.empty}>{t("findingDetail.noHistory")}</p>
            )}
          </section>
        </>
      )}
    </AppLayout>
  );
}

export default FindingDetail;
