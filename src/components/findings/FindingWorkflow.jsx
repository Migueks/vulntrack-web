import { useState } from "react";

import { Save, UserCheck } from "lucide-react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useTranslation } from "react-i18next";

import {
  addFindingNote,
  assignFinding,
  updateFindingStatus,
} from "../../api/findingsApi";

import { getUsers } from "../../api/usersApi";

import { useAuth } from "../../context/useAuth";

import styles from "./FindingWorkflow.module.css";

const CLOSED_STATUSES = ["RESOLVED", "ACCEPTED_RISK", "FALSE_POSITIVE"];

const CLOSING_STATUSES = ["RESOLVED", "ACCEPTED_RISK", "FALSE_POSITIVE"];

// Devuelve las transiciones permitidas según el estado y el rol.
const getAllowedStatuses = (status, isAdmin) => {
  const transitions = {
    OPEN: isAdmin
      ? ["IN_PROGRESS", "ACCEPTED_RISK", "FALSE_POSITIVE"]
      : ["IN_PROGRESS"],

    IN_PROGRESS: ["OPEN", "MITIGATED"],

    MITIGATED: ["IN_PROGRESS", "RESOLVED"],

    RESOLVED: isAdmin ? ["OPEN"] : [],

    ACCEPTED_RISK: [],

    FALSE_POSITIVE: [],
  };

  return transitions[status] ?? [];
};

function FindingWorkflow({ finding }) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const queryClient = useQueryClient();

  // Estados del formulario de gestión.
  const [assignedToId, setAssignedToId] = useState(
    finding.assignedTo?.id ?? "",
  );

  const [nextStatus, setNextStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [historyNote, setHistoryNote] = useState("");

  // Permisos derivados del usuario actual.
  const isAdmin = user?.role === "ADMIN";

  const isAssignedAnalyst =
    user?.role === "ANALYST" && finding.assignedTo?.id === user.id;

  const isClosed = CLOSED_STATUSES.includes(finding.status);

  const allowedStatuses = getAllowedStatuses(finding.status, isAdmin);

  // ADMIN necesita conocer los usuarios disponibles para asignar trabajo.
  const { data: users = [] } = useQuery({
    queryKey: ["users", "assignment"],
    queryFn: getUsers,
    enabled: isAdmin,
    staleTime: 60_000,
  });

  const assignableUsers = users.filter(
    (item) => item.isActive && ["ADMIN", "ANALYST"].includes(item.role),
  );

  // Refresca el detalle y los datos relacionados tras una operación.
  const refreshFinding = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["finding", finding.id],
      }),

      queryClient.invalidateQueries({
        queryKey: ["findings"],
      }),

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      }),
    ]);
  };

  // Gestiona la asignación del hallazgo.
  const assignmentMutation = useMutation({
    mutationFn: (newAssigneeId) =>
      assignFinding(finding.id, newAssigneeId || null),

    onSuccess: refreshFinding,
  });

  // Gestiona el cambio de estado.
  const statusMutation = useMutation({
    mutationFn: () => updateFindingStatus(finding.id, nextStatus, statusNote),

    onSuccess: async () => {
      setNextStatus("");
      setStatusNote("");

      await refreshFinding();
    },
  });

  // Añade una nota al historial.
  const noteMutation = useMutation({
    mutationFn: () => addFindingNote(finding.id, historyNote),

    onSuccess: async () => {
      setHistoryNote("");

      await refreshFinding();
    },
  });

  const requiresClosingNote = CLOSING_STATUSES.includes(nextStatus);

  const canAddNote = isAdmin || (isAssignedAnalyst && !isClosed);

  return (
    <section className={styles.card}>
      {/* Encabezado */}

      <div className={styles.heading}>
        <div>
          <h2>{t("findingWorkflow.title")}</h2>

          <p>{t("findingWorkflow.description")}</p>
        </div>
      </div>

      {/* Asignación */}

      {isAdmin && !isClosed && (
        <div className={styles.block}>
          <label htmlFor="finding-assignee">
            {t("findingWorkflow.assignee")}
          </label>

          <div className={styles.row}>
            <select
              id="finding-assignee"
              value={assignedToId}
              onChange={(event) => setAssignedToId(event.target.value)}
            >
              {finding.status === "OPEN" && (
                <option value="">{t("findings.unassigned")}</option>
              )}

              {assignableUsers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {t(`roles.${item.role}`)}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => assignmentMutation.mutate(assignedToId)}
              disabled={assignmentMutation.isPending}
            >
              <UserCheck size={16} aria-hidden="true" />

              {t("findingWorkflow.assign")}
            </button>
          </div>
        </div>
      )}

      {/* Autoasignación */}

      {user?.role === "ANALYST" &&
        finding.status === "OPEN" &&
        !finding.assignedTo && (
          <div className={styles.block}>
            <button
              type="button"
              onClick={() => assignmentMutation.mutate(user.id)}
              disabled={assignmentMutation.isPending}
            >
              <UserCheck size={16} aria-hidden="true" />

              {t("findingWorkflow.assignToMe")}
            </button>
          </div>
        )}

      {/* Cambio de estado */}

      {(isAdmin || isAssignedAnalyst) && allowedStatuses.length > 0 && (
        <div className={styles.block}>
          <label htmlFor="finding-status">
            {t("findingWorkflow.changeStatus")}
          </label>

          <select
            id="finding-status"
            value={nextStatus}
            onChange={(event) => setNextStatus(event.target.value)}
          >
            <option value="">{t("findingWorkflow.selectStatus")}</option>

            {allowedStatuses.map((status) => (
              <option key={status} value={status}>
                {t(`findingStatus.${status}`)}
              </option>
            ))}
          </select>

          {nextStatus && (
            <textarea
              value={statusNote}
              onChange={(event) => setStatusNote(event.target.value)}
              placeholder={
                requiresClosingNote
                  ? t("findingWorkflow.closingNote")
                  : t("findingWorkflow.optionalNote")
              }
              rows={3}
            />
          )}

          <button
            type="button"
            onClick={() => statusMutation.mutate()}
            disabled={
              !nextStatus ||
              statusMutation.isPending ||
              (requiresClosingNote && statusNote.trim().length < 10)
            }
          >
            <Save size={16} aria-hidden="true" />

            {t("findingWorkflow.updateStatus")}
          </button>
        </div>
      )}

      {/* Nota de seguimiento */}

      {canAddNote && (
        <div className={styles.block}>
          <label htmlFor="finding-note">{t("findingWorkflow.addNote")}</label>

          <textarea
            id="finding-note"
            value={historyNote}
            onChange={(event) => setHistoryNote(event.target.value)}
            placeholder={t("findingWorkflow.notePlaceholder")}
            rows={3}
          />

          <button
            type="button"
            onClick={() => noteMutation.mutate()}
            disabled={historyNote.trim().length < 3 || noteMutation.isPending}
          >
            <Save size={16} aria-hidden="true" />

            {t("findingWorkflow.saveNote")}
          </button>
        </div>
      )}

      {/* Errores */}

      {(assignmentMutation.isError ||
        statusMutation.isError ||
        noteMutation.isError) && (
        <p className={styles.error}>
          {assignmentMutation.error?.message ||
            statusMutation.error?.message ||
            noteMutation.error?.message ||
            t("findingWorkflow.error")}
        </p>
      )}
    </section>
  );
}

export default FindingWorkflow;
