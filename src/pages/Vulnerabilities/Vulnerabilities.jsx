import { useDeferredValue, useState } from "react";
import { useNavigate } from "react-router";

import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  ShieldAlert,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { getVulnerabilities } from "../../api/vulnerabilitiesApi";
import AppLayout from "../../components/layout/AppLayout";

import styles from "./Vulnerabilities.module.css";

function Vulnerabilities() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Estados de búsqueda, filtros y paginación.
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  // Evita lanzar una petición por cada pulsación.
  const deferredSearch = useDeferredValue(search);

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: [
      "vulnerabilities",
      {
        search: deferredSearch,
        severity,
        category,
        status,
        page,
      },
    ],

    queryFn: () =>
      getVulnerabilities({
        search: deferredSearch.trim(),
        severity,
        category,
        status,
        page,
        limit: 10,
        sortBy: "vulnerabilityCode",
        order: "asc",
      }),

    staleTime: 30_000,

    // Mantiene la página anterior mientras llegan nuevos datos.
    placeholderData: (previousData) => previousData,
  });

  const vulnerabilities = data?.vulnerabilities ?? [];
  const pagination = data?.pagination;

  const totalPages = pagination?.totalPages ?? 1;
  const totalVulnerabilities = pagination?.total ?? vulnerabilities.length;

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleFilterChange = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  return (
    <AppLayout>
      {/* Encabezado */}

      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>
            <ShieldAlert size={16} aria-hidden="true" />
            {t("vulnerabilities.eyebrow")}
          </span>

          <h1>{t("vulnerabilities.title")}</h1>
          <p>{t("vulnerabilities.description")}</p>
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

          {t("vulnerabilities.refresh")}
        </button>
      </div>

      {/* Cargando */}

      {isPending && (
        <div className={styles.message} role="status">
          {t("vulnerabilities.loading")}
        </div>
      )}

      {/* Error */}

      {isError && (
        <div className={styles.error} role="alert">
          <p>{t("errors.vulnerabilities")}</p>

          <button type="button" onClick={() => void refetch()}>
            {t("common.retry")}
          </button>
        </div>
      )}

      {/* Catálogo */}

      {!isPending && !isError && (
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>{t("vulnerabilities.catalog")}</h2>

              <p>
                {t("vulnerabilities.visible", {
                  count: totalVulnerabilities,
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
                onChange={handleSearchChange}
                placeholder={t("vulnerabilities.search")}
                aria-label={t("vulnerabilities.search")}
              />
            </div>

            <select
              className={styles.control}
              value={severity}
              onChange={handleFilterChange(setSeverity)}
            >
              <option value="">{t("vulnerabilities.allSeverities")}</option>
              <option value="CRITICAL">
                {t("vulnerabilitySeverity.CRITICAL")}
              </option>
              <option value="HIGH">{t("vulnerabilitySeverity.HIGH")}</option>
              <option value="MEDIUM">
                {t("vulnerabilitySeverity.MEDIUM")}
              </option>
              <option value="LOW">{t("vulnerabilitySeverity.LOW")}</option>
            </select>

            <select
              className={styles.control}
              value={category}
              onChange={handleFilterChange(setCategory)}
            >
              <option value="">{t("vulnerabilities.allCategories")}</option>
              <option value="WEB">{t("vulnerabilityCategory.WEB")}</option>
              <option value="NETWORK">
                {t("vulnerabilityCategory.NETWORK")}
              </option>
              <option value="CONFIGURATION">
                {t("vulnerabilityCategory.CONFIGURATION")}
              </option>
              <option value="AUTHENTICATION">
                {t("vulnerabilityCategory.AUTHENTICATION")}
              </option>
              <option value="ACCESS_CONTROL">
                {t("vulnerabilityCategory.ACCESS_CONTROL")}
              </option>
              <option value="CRYPTOGRAPHY">
                {t("vulnerabilityCategory.CRYPTOGRAPHY")}
              </option>
              <option value="DEPENDENCY">
                {t("vulnerabilityCategory.DEPENDENCY")}
              </option>
              <option value="DATABASE">
                {t("vulnerabilityCategory.DATABASE")}
              </option>
              <option value="OPERATING_SYSTEM">
                {t("vulnerabilityCategory.OPERATING_SYSTEM")}
              </option>
              <option value="OTHER">{t("vulnerabilityCategory.OTHER")}</option>
            </select>

            <select
              className={styles.control}
              value={status}
              onChange={handleFilterChange(setStatus)}
            >
              <option value="">{t("vulnerabilities.allStatuses")}</option>
              <option value="ACTIVE">{t("vulnerabilityStatus.ACTIVE")}</option>
              <option value="ARCHIVED">
                {t("vulnerabilityStatus.ARCHIVED")}
              </option>
            </select>
          </div>

          {vulnerabilities.length === 0 ? (
            <div className={styles.empty}>
              <ShieldAlert size={32} aria-hidden="true" />
              <p>{t("vulnerabilities.empty")}</p>
            </div>
          ) : (
            <>
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t("vulnerabilities.code")}</th>
                      <th>{t("vulnerabilities.titleColumn")}</th>
                      <th>{t("vulnerabilities.cve")}</th>
                      <th>{t("vulnerabilities.cvss")}</th>
                      <th>{t("vulnerabilities.severity")}</th>
                      <th>{t("vulnerabilities.status")}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {vulnerabilities.map((vulnerability) => (
                      <tr
                        key={vulnerability.id}
                        className={styles.clickableRow}
                        tabIndex={0}
                        role="link"
                        onClick={() =>
                          navigate(`/vulnerabilities/${vulnerability.id}`)
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            navigate(`/vulnerabilities/${vulnerability.id}`);
                          }
                        }}
                      >
                        <td data-label={t("vulnerabilities.code")}>
                          <span className={styles.code}>
                            {vulnerability.vulnerabilityCode}
                          </span>
                        </td>

                        <td data-label={t("vulnerabilities.titleColumn")}>
                          <strong className={styles.name}>
                            {vulnerability.title}
                          </strong>
                        </td>

                        <td data-label={t("vulnerabilities.cve")}>
                          {vulnerability.cveId || "—"}
                        </td>

                        <td data-label={t("vulnerabilities.cvss")}>
                          <span className={styles.cvss}>
                            {Number(vulnerability.cvssScore).toFixed(1)}
                          </span>
                        </td>

                        <td data-label={t("vulnerabilities.severity")}>
                          <span
                            className={styles.severityBadge}
                            data-severity={vulnerability.severity}
                          >
                            {t(
                              `vulnerabilitySeverity.${vulnerability.severity}`,
                            )}
                          </span>
                        </td>

                        <td data-label={t("vulnerabilities.status")}>
                          <span
                            className={styles.statusBadge}
                            data-status={vulnerability.status}
                          >
                            {t(`vulnerabilityStatus.${vulnerability.status}`)}
                          </span>
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
                  {t("vulnerabilities.previous")}
                </button>

                <span className={styles.pageInfo}>
                  {t("vulnerabilities.page", {
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
                  {t("vulnerabilities.next")}
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

export default Vulnerabilities;
