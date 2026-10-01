import { useDeferredValue, useState } from "react";

import { useNavigate, useSearchParams } from "react-router";

import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  RefreshCw,
  Search,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { getFindings } from "../../api/findingsApi";
import AppLayout from "../../components/layout/AppLayout";

import styles from "./Findings.module.css";

function Findings() {
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  // Estados de búsqueda, filtros y paginación.
  const [search, setSearch] = useState("");

  const [priority, setPriority] = useState(searchParams.get("priority") ?? "");

  const [status, setStatus] = useState(searchParams.get("status") ?? "");

  const [overdue, setOverdue] = useState(searchParams.get("overdue") ?? "");

  const [page, setPage] = useState(1);

  // Evita lanzar una petición por cada pulsación.
  const deferredSearch = useDeferredValue(search);

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: [
      "findings",
      {
        search: deferredSearch,
        priority,
        status,
        overdue,
        page,
      },
    ],

    queryFn: () =>
      getFindings({
        search: deferredSearch.trim(),
        priority,
        status,
        overdue,
        page,
        limit: 10,
        sortBy: "detectedAt",
        order: "desc",
      }),

    staleTime: 30_000,

    // Mantiene la página anterior mientras llegan los nuevos datos.
    placeholderData: (previousData) => previousData,
  });

  const findings = data?.findings ?? [];

  const pagination = data?.pagination;

  const totalPages = pagination?.totalPages ?? 1;

  const totalFindings = pagination?.total ?? findings.length;

  // Formatea las fechas según el idioma activo.
  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      i18n.language === "es" ? "es-ES" : "en-GB",
    );
  };

  // Actualiza un filtro y mantiene la URL sincronizada.
  const handleQueryFilterChange = (key, setter) => (event) => {
    const value = event.target.value;

    setter(value);
    setPage(1);

    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);

        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }

        return next;
      },
      {
        replace: true,
      },
    );
  };

  return (
    <AppLayout>
      {/* Encabezado */}

      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>
            <ClipboardList size={16} aria-hidden="true" />

            {t("findings.eyebrow")}
          </span>

          <h1>{t("findings.title")}</h1>

          <p>{t("findings.description")}</p>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            size={16}
            className={isFetching ? styles.spinning : undefined}
            aria-hidden="true"
          />

          {t("findings.refresh")}
        </button>
      </div>

      {/* Cargando */}

      {isPending && (
        <div className={styles.message} role="status">
          {t("findings.loading")}
        </div>
      )}

      {/* Error */}

      {isError && (
        <div className={styles.error} role="alert">
          <p>{t("errors.findings")}</p>

          <button type="button" onClick={() => void refetch()}>
            {t("common.retry")}
          </button>
        </div>
      )}

      {/* Listado */}

      {!isPending && !isError && (
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>{t("findings.list")}</h2>

              <p>
                {t("findings.visible", {
                  count: totalFindings,
                })}
              </p>
            </div>
          </div>

          {/* Búsqueda y filtros */}

          <div className={styles.controls}>
            <div className={styles.searchWrapper}>
              <Search
                size={16}
                className={styles.searchIcon}
                aria-hidden="true"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);

                  setPage(1);
                }}
                placeholder={t("findings.search")}
                aria-label={t("findings.search")}
              />
            </div>

            <select
              className={styles.control}
              value={priority}
              onChange={handleQueryFilterChange("priority", setPriority)}
            >
              <option value="">{t("findings.allPriorities")}</option>

              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
              <option value="P4">P4</option>
            </select>

            <select
              className={styles.control}
              value={status}
              onChange={handleQueryFilterChange("status", setStatus)}
            >
              <option value="">{t("findings.allStatuses")}</option>

              <option value="OPEN">{t("findingStatus.OPEN")}</option>

              <option value="IN_PROGRESS">
                {t("findingStatus.IN_PROGRESS")}
              </option>

              <option value="MITIGATED">{t("findingStatus.MITIGATED")}</option>

              <option value="RESOLVED">{t("findingStatus.RESOLVED")}</option>

              <option value="ACCEPTED_RISK">
                {t("findingStatus.ACCEPTED_RISK")}
              </option>

              <option value="FALSE_POSITIVE">
                {t("findingStatus.FALSE_POSITIVE")}
              </option>
            </select>

            <select
              className={styles.control}
              value={overdue}
              onChange={handleQueryFilterChange("overdue", setOverdue)}
            >
              <option value="">{t("findings.allDeadlines")}</option>

              <option value="true">{t("findings.overdueOnly")}</option>

              <option value="false">{t("findings.notOverdue")}</option>
            </select>
          </div>

          {findings.length === 0 ? (
            <div className={styles.empty}>
              <ClipboardList size={32} aria-hidden="true" />

              <p>{t("findings.empty")}</p>
            </div>
          ) : (
            <>
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t("findings.code")}</th>

                      <th>{t("findings.asset")}</th>

                      <th>{t("findings.vulnerability")}</th>

                      <th>{t("findings.priority")}</th>

                      <th>{t("findings.status")}</th>

                      <th>{t("findings.assignedTo")}</th>

                      <th>{t("findings.dueDate")}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {findings.map((finding) => (
                      <tr
                        key={finding.id}
                        className={styles.clickableRow}
                        tabIndex={0}
                        role="link"
                        onClick={() => navigate(`/findings/${finding.id}`)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            navigate(`/findings/${finding.id}`);
                          }
                        }}
                      >
                        <td data-label={t("findings.code")}>
                          <span className={styles.code}>
                            {finding.findingCode}
                          </span>
                        </td>

                        <td data-label={t("findings.asset")}>
                          {finding.asset?.name ?? "—"}
                        </td>

                        <td data-label={t("findings.vulnerability")}>
                          <strong className={styles.name}>
                            {finding.vulnerability?.title ?? "—"}
                          </strong>
                        </td>

                        <td data-label={t("findings.priority")}>
                          <span
                            className={styles.priorityBadge}
                            data-priority={finding.priority}
                          >
                            {finding.priority}
                          </span>
                        </td>

                        <td data-label={t("findings.status")}>
                          <span
                            className={styles.statusBadge}
                            data-status={finding.status}
                          >
                            {t(`findingStatus.${finding.status}`)}
                          </span>
                        </td>

                        <td data-label={t("findings.assignedTo")}>
                          {finding.assignedTo?.name ?? t("findings.unassigned")}
                        </td>

                        <td data-label={t("findings.dueDate")}>
                          <div className={styles.dueDate}>
                            {finding.overdue && (
                              <AlertTriangle
                                size={14}
                                aria-label={t("findings.overdue")}
                              />
                            )}

                            <span
                              className={
                                finding.overdue ? styles.overdue : undefined
                              }
                            >
                              {formatDate(finding.dueDate)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}

              <div className={styles.pagination}>
                <button
                  type="button"
                  className={styles.paginationButton}
                  onClick={() => setPage((current) => current - 1)}
                  disabled={page <= 1 || isFetching}
                >
                  <ChevronLeft size={16} aria-hidden="true" />

                  {t("findings.previous")}
                </button>

                <span className={styles.pageInfo}>
                  {t("findings.page", {
                    page,
                    totalPages,
                  })}
                </span>

                <button
                  type="button"
                  className={styles.paginationButton}
                  onClick={() => setPage((current) => current + 1)}
                  disabled={page >= totalPages || isFetching}
                >
                  {t("findings.next")}

                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </>
          )}
        </section>
      )}
    </AppLayout>
  );
}

export default Findings;
