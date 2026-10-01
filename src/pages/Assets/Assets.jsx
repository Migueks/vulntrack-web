import { useDeferredValue, useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  Database,
  RefreshCw,
  Search,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { getAssets } from "../../api/assetsApi";
import AppLayout from "../../components/layout/AppLayout";

import styles from "./Assets.module.css";

function Assets() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Estados de búsqueda, filtros y paginación.
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [criticality, setCriticality] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  // Retrasa la búsqueda para evitar una petición por cada pulsación.
  const deferredSearch = useDeferredValue(search);

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: [
      "assets",
      {
        search: deferredSearch,
        type,
        criticality,
        status,
        page,
      },
    ],

    queryFn: () =>
      getAssets({
        search: deferredSearch.trim(),
        type,
        criticality,
        status,
        page,
        limit: 10,
        sortBy: "assetCode",
        order: "asc",
      }),

    staleTime: 30_000,

    // Mantiene los datos anteriores mientras se carga otra página.
    placeholderData: (previousData) => previousData,
  });

  const assets = data?.assets ?? [];
  const pagination = data?.pagination;

  const totalPages = pagination?.totalPages ?? 1;
  const totalAssets = pagination?.total ?? assets.length;

  // Al cambiar búsqueda o filtros volvemos a la primera página.
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
            <Database size={16} aria-hidden="true" />
            {t("assets.eyebrow")}
          </span>

          <h1>{t("assets.title")}</h1>
          <p>{t("assets.description")}</p>
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

          {t("assets.refresh")}
        </button>
      </div>

      {/* Cargando */}
      {isPending && (
        <div className={styles.message} role="status">
          {t("assets.loading")}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className={styles.error} role="alert">
          <p>{t("errors.assets")}</p>

          <button type="button" onClick={() => void refetch()}>
            {t("common.retry")}
          </button>
        </div>
      )}

      {/* Inventario */}
      {!isPending && !isError && (
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>{t("assets.inventory")}</h2>

              <p>
                {t("assets.visibleAssets", {
                  count: totalAssets,
                })}
              </p>
            </div>
          </div>

          {/* Buscador y filtros */}
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
                placeholder={t("assets.search")}
                aria-label={t("assets.search")}
              />
            </div>

            <select
              className={styles.control}
              value={type}
              onChange={handleFilterChange(setType)}
              aria-label={t("assets.filterType")}
            >
              <option value="">{t("assets.allTypes")}</option>
              <option value="SERVER">{t("assetType.SERVER")}</option>
              <option value="WORKSTATION">{t("assetType.WORKSTATION")}</option>
              <option value="NETWORK">{t("assetType.NETWORK")}</option>
              <option value="WEB_APPLICATION">
                {t("assetType.WEB_APPLICATION")}
              </option>
              <option value="DATABASE">{t("assetType.DATABASE")}</option>
              <option value="CLOUD">{t("assetType.CLOUD")}</option>
              <option value="OTHER">{t("assetType.OTHER")}</option>
            </select>

            <select
              className={styles.control}
              value={criticality}
              onChange={handleFilterChange(setCriticality)}
              aria-label={t("assets.filterCriticality")}
            >
              <option value="">{t("assets.allCriticalities")}</option>
              <option value="CRITICAL">{t("assetCriticality.CRITICAL")}</option>
              <option value="HIGH">{t("assetCriticality.HIGH")}</option>
              <option value="MEDIUM">{t("assetCriticality.MEDIUM")}</option>
              <option value="LOW">{t("assetCriticality.LOW")}</option>
            </select>

            <select
              className={styles.control}
              value={status}
              onChange={handleFilterChange(setStatus)}
              aria-label={t("assets.filterStatus")}
            >
              <option value="">{t("assets.allStatuses")}</option>
              <option value="ACTIVE">{t("assetStatus.ACTIVE")}</option>
              <option value="INACTIVE">{t("assetStatus.INACTIVE")}</option>
              <option value="DECOMMISSIONED">
                {t("assetStatus.DECOMMISSIONED")}
              </option>
            </select>
          </div>

          {assets.length === 0 ? (
            <div className={styles.empty}>
              <Database size={32} aria-hidden="true" />
              <p>{t("assets.empty")}</p>
            </div>
          ) : (
            <>
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">{t("assets.code")}</th>
                      <th scope="col">{t("assets.name")}</th>
                      <th scope="col">{t("assets.type")}</th>
                      <th scope="col">{t("assets.criticality")}</th>
                      <th scope="col">{t("assets.status")}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {assets.map((asset) => {
                      const assetId = asset.id ?? asset._id;

                      return (
                        <tr
                          key={assetId}
                          className={styles.clickableRow}
                          tabIndex={0}
                          role="link"
                          onClick={() => navigate(`/assets/${assetId}`)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              navigate(`/assets/${assetId}`);
                            }
                          }}
                        >
                          <td data-label={t("assets.code")}>
                            <span className={styles.code}>
                              {asset.assetCode ?? "—"}
                            </span>
                          </td>

                          <td data-label={t("assets.name")}>
                            <strong className={styles.name}>
                              {asset.name ?? "—"}
                            </strong>
                          </td>

                          <td data-label={t("assets.type")}>
                            {asset.type
                              ? t(`assetType.${asset.type}`, {
                                  defaultValue: asset.type,
                                })
                              : "—"}
                          </td>

                          <td data-label={t("assets.criticality")}>
                            <span
                              className={styles.criticalityBadge}
                              data-criticality={asset.criticality}
                            >
                              {asset.criticality
                                ? t(`assetCriticality.${asset.criticality}`)
                                : "—"}
                            </span>
                          </td>

                          <td data-label={t("assets.status")}>
                            <span
                              className={styles.statusBadge}
                              data-status={asset.status}
                            >
                              {asset.status
                                ? t(`assetStatus.${asset.status}`)
                                : "—"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
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
                  {t("assets.previous")}
                </button>

                <span className={styles.pageInfo}>
                  {t("assets.page", {
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
                  {t("assets.next")}
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

export default Assets;
