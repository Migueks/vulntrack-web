import { useState } from "react";

import { Download, FileText, Trash2, Upload } from "lucide-react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTranslation } from "react-i18next";

import {
  deleteFindingEvidence,
  downloadFindingEvidence,
  uploadFindingEvidence,
} from "../../api/findingsApi";

import { useAuth } from "../../context/useAuth";

import styles from "./FindingEvidence.module.css";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_EVIDENCE_COUNT = 10;

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
];

const CLOSED_STATUSES = ["RESOLVED", "ACCEPTED_RISK", "FALSE_POSITIVE"];

function FindingEvidence({ finding }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const queryClient = useQueryClient();

  const [file, setFile] = useState(null);
  const [clientError, setClientError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isAdmin = user?.role === "ADMIN";

  const isAssignedAnalyst =
    user?.role === "ANALYST" && finding.assignedTo?.id === user.id;

  const isClosed = CLOSED_STATUSES.includes(finding.status);

  const canManage = !isClosed && (isAdmin || isAssignedAnalyst);

  const canDownload = isAdmin || isAssignedAnalyst;

  const evidence = finding.evidence ?? [];

  // Refresca el detalle y su historial después de cada operación.
  const refreshFinding = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["finding", finding.id],
    });
  };

  const uploadMutation = useMutation({
    mutationFn: () => uploadFindingEvidence(finding.id, file),

    onSuccess: async () => {
      setFile(null);
      setClientError("");

      setSuccessMessage(t("findingEvidence.uploadSuccess"));

      await refreshFinding();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (evidenceId) => deleteFindingEvidence(finding.id, evidenceId),

    onSuccess: async () => {
      setClientError("");

      setSuccessMessage(t("findingEvidence.deleteSuccess"));

      await refreshFinding();
    },
  });

  const downloadMutation = useMutation({
    mutationFn: (item) =>
      downloadFindingEvidence(finding.id, item.id, item.originalName),
  });

  // Comprueba formato y tamaño antes de enviar el archivo.
  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setClientError("");
    setSuccessMessage("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setFile(null);
      event.target.value = "";

      setClientError(t("findingEvidence.invalidType"));

      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      event.target.value = "";

      setClientError(t("findingEvidence.tooLarge"));

      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = () => {
    setClientError("");
    setSuccessMessage("");

    uploadMutation.mutate();
  };

  // Solicita confirmación antes de eliminar una evidencia.
  const handleDelete = (item) => {
    setClientError("");
    setSuccessMessage("");

    const confirmed = window.confirm(
      t("findingEvidence.confirmDelete", {
        name: item.originalName,
      }),
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(item.id);
  };

  // Solo ADMIN puede borrar archivos subidos por otros usuarios.
  const canDeleteEvidence = (item) =>
    canManage && (isAdmin || item.uploadedBy?.id === user?.id);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(
      i18n.language === "es" ? "es-ES" : "en-GB",
    );

  return (
    <section className={styles.card}>
      {/* Encabezado */}

      <div className={styles.heading}>
        <div>
          <h2>{t("findingDetail.evidence")}</h2>

          <p>
            {t("findingDetail.evidenceCount", {
              count: evidence.length,
            })}
          </p>
        </div>
      </div>

      {/* Subida */}

      {canManage && evidence.length < MAX_EVIDENCE_COUNT && (
        <div className={styles.upload}>
          <label htmlFor="finding-evidence">
            {t("findingEvidence.selectFile")}
          </label>

          <input
            id="finding-evidence"
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.pdf"
            onChange={handleFileChange}
          />

          <p className={styles.help}>{t("findingEvidence.help")}</p>

          {file && (
            <div className={styles.selectedFile}>
              <FileText size={16} aria-hidden="true" />

              <span>{file.name}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || uploadMutation.isPending}
          >
            <Upload size={16} aria-hidden="true" />

            {uploadMutation.isPending
              ? t("findingEvidence.uploading")
              : t("findingEvidence.upload")}
          </button>
        </div>
      )}

      {/* Confirmación de operaciones */}

      {successMessage && (
        <p className={styles.success} role="status">
          {successMessage}
        </p>
      )}

      {/* Listado */}

      {evidence.length ? (
        <div className={styles.list}>
          {evidence.map((item) => (
            <div key={item.id} className={styles.item}>
              <FileText size={18} aria-hidden="true" />

              <div className={styles.info}>
                <strong>{item.originalName}</strong>

                <span>
                  {item.uploadedBy?.name ?? "—"} · {formatDate(item.uploadedAt)}
                </span>
              </div>

              <div className={styles.actions}>
                {canDownload && (
                  <button
                    type="button"
                    onClick={() => downloadMutation.mutate(item)}
                    disabled={downloadMutation.isPending}
                    aria-label={t("findingEvidence.download")}
                  >
                    <Download size={16} aria-hidden="true" />
                  </button>
                )}

                {canDeleteEvidence(item) && (
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => handleDelete(item)}
                    disabled={deleteMutation.isPending}
                    aria-label={t("findingEvidence.delete")}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>{t("findingDetail.noEvidence")}</p>
      )}

      {/* Errores */}

      {(clientError ||
        uploadMutation.isError ||
        deleteMutation.isError ||
        downloadMutation.isError) && (
        <p className={styles.error}>
          {clientError ||
            uploadMutation.error?.message ||
            deleteMutation.error?.message ||
            downloadMutation.error?.message ||
            t("findingEvidence.error")}
        </p>
      )}
    </section>
  );
}

export default FindingEvidence;
