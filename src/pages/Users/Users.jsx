import { useDeferredValue, useState } from "react";

import {
  Pencil,
  Power,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useTranslation } from "react-i18next";

import {
  createUser,
  getUsers,
  updateUser,
  updateUserStatus,
} from "../../api/usersApi";

import { useAuth } from "../../context/useAuth";
import AppLayout from "../../components/layout/AppLayout";

import styles from "./Users.module.css";

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "VIEWER",
};

function Users() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();

  const queryClient = useQueryClient();

  // Estados de búsqueda y filtros.
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  // Estados del formulario.
  const [formMode, setFormMode] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // Feedback de operaciones correctas.
  const [successMessage, setSuccessMessage] = useState("");

  const deferredSearch = useDeferredValue(search);

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["users"],
    queryFn: () =>
      getUsers({
        page: 1,
        limit: 100,
      }),
    staleTime: 30_000,
  });

  const users = data?.users ?? [];

  // Filtra el listado administrativo en cliente.
  const normalizedSearch = deferredSearch.trim().toLowerCase();

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !normalizedSearch ||
      user.name.toLowerCase().includes(normalizedSearch) ||
      user.email.toLowerCase().includes(normalizedSearch) ||
      user.userCode.toLowerCase().includes(normalizedSearch);

    const matchesRole = !role || user.role === role;

    const matchesStatus = !status || String(user.isActive) === status;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Refresca los usuarios tras una operación administrativa.
  const refreshUsers = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["users"],
    });
  };

  // Restablece y cierra el formulario.
  const closeForm = () => {
    setFormMode(null);
    setEditingUserId(null);
    setForm(EMPTY_FORM);
  };

  const createMutation = useMutation({
    mutationFn: createUser,

    onSuccess: async () => {
      setSuccessMessage(t("users.createSuccess"));

      closeForm();
      await refreshUsers();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),

    onSuccess: async () => {
      setSuccessMessage(t("users.updateSuccess"));

      closeForm();
      await refreshUsers();
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }) => updateUserStatus(id, isActive),

    onSuccess: async (_, variables) => {
      setSuccessMessage(
        variables.isActive
          ? t("users.activateSuccess")
          : t("users.deactivateSuccess"),
      );

      await refreshUsers();
    },
  });

  // Abre un formulario limpio para una nueva cuenta.
  const openCreateForm = () => {
    setSuccessMessage("");

    setFormMode("create");
    setEditingUserId(null);
    setForm(EMPTY_FORM);
  };

  // Carga los datos editables del usuario seleccionado.
  const openEditForm = (user) => {
    setSuccessMessage("");

    setFormMode("edit");
    setEditingUserId(user.id);

    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setSuccessMessage("");

    if (formMode === "create") {
      createMutation.mutate(form);
      return;
    }

    updateMutation.mutate({
      id: editingUserId,

      data: {
        name: form.name,
        email: form.email,
        role: form.role,
      },
    });
  };

  // Solicita confirmación antes de desactivar una cuenta.
  const handleStatusToggle = (user) => {
    setSuccessMessage("");

    if (
      user.isActive &&
      !window.confirm(
        t("users.confirmDeactivate", {
          name: user.name,
        }),
      )
    ) {
      return;
    }

    statusMutation.mutate({
      id: user.id,
      isActive: !user.isActive,
    });
  };

  const mutationError =
    createMutation.error?.message ||
    updateMutation.error?.message ||
    statusMutation.error?.message;

  return (
    <AppLayout>
      {/* Encabezado */}

      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>
            <ShieldCheck size={16} aria-hidden="true" />
            {t("users.eyebrow")}
          </span>

          <h1>{t("users.title")}</h1>

          <p>{t("users.description")}</p>
        </div>

        <div className={styles.headingActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              size={16}
              className={isFetching ? styles.spinning : undefined}
              aria-hidden="true"
            />

            {t("users.refresh")}
          </button>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={openCreateForm}
          >
            <UserPlus size={16} aria-hidden="true" />

            {t("users.create")}
          </button>
        </div>
      </div>

      {/* Formulario */}

      {formMode && (
        <section className={styles.formCard}>
          <div className={styles.formHeader}>
            <div>
              <h2>
                {formMode === "create"
                  ? t("users.createTitle")
                  : t("users.editTitle")}
              </h2>

              <p>
                {formMode === "create"
                  ? t("users.createDescription")
                  : t("users.editDescription")}
              </p>
            </div>

            <button
              type="button"
              className={styles.iconButton}
              onClick={closeForm}
              aria-label={t("users.close")}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label>
              <span>{t("users.name")}</span>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                minLength={2}
                maxLength={100}
                required
              />
            </label>

            <label>
              <span>{t("users.email")}</span>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            {formMode === "create" && (
              <label>
                <span>{t("users.password")}</span>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={15}
                  required
                />

                <small>{t("users.passwordHelp")}</small>
              </label>
            )}

            <label>
              <span>{t("users.role")}</span>

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                disabled={
                  formMode === "edit" && editingUserId === currentUser?.id
                }
              >
                <option value="ADMIN">{t("roles.ADMIN")}</option>

                <option value="ANALYST">{t("roles.ANALYST")}</option>

                <option value="VIEWER">{t("roles.VIEWER")}</option>
              </select>
            </label>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={closeForm}
              >
                {t("users.cancel")}
              </button>

              <button
                type="submit"
                className={styles.primaryButton}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Save size={16} aria-hidden="true" />

                {t("users.save")}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Estados de página */}

      {isPending && <div className={styles.message}>{t("users.loading")}</div>}

      {isError && <div className={styles.error}>{t("errors.users")}</div>}

      {mutationError && <div className={styles.error}>{mutationError}</div>}

      {successMessage && (
        <div className={styles.success} role="status">
          {successMessage}
        </div>
      )}

      {/* Listado */}

      {!isPending && !isError && (
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>{t("users.list")}</h2>

              <p>
                {t("users.visible", {
                  count: filteredUsers.length,
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
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("users.search")}
              />
            </div>

            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="">{t("users.allRoles")}</option>

              <option value="ADMIN">{t("roles.ADMIN")}</option>

              <option value="ANALYST">{t("roles.ANALYST")}</option>

              <option value="VIEWER">{t("roles.VIEWER")}</option>
            </select>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">{t("users.allStatuses")}</option>

              <option value="true">{t("users.active")}</option>

              <option value="false">{t("users.inactive")}</option>
            </select>
          </div>

          {filteredUsers.length === 0 ? (
            <div className={styles.empty}>
              <UsersRound size={32} aria-hidden="true" />

              <p>{t("users.empty")}</p>
            </div>
          ) : (
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t("users.code")}</th>
                    <th>{t("users.name")}</th>
                    <th>{t("users.email")}</th>
                    <th>{t("users.role")}</th>
                    <th>{t("users.status")}</th>
                    <th>{t("users.actions")}</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => {
                    const isCurrentUser = user.id === currentUser?.id;

                    return (
                      <tr key={user.id}>
                        <td data-label={t("users.code")}>
                          <span className={styles.code}>{user.userCode}</span>
                        </td>

                        <td data-label={t("users.name")}>
                          <strong className={styles.name}>{user.name}</strong>
                        </td>

                        <td data-label={t("users.email")}>{user.email}</td>

                        <td data-label={t("users.role")}>
                          <span
                            className={styles.roleBadge}
                            data-role={user.role}
                          >
                            {t(`roles.${user.role}`)}
                          </span>
                        </td>

                        <td data-label={t("users.status")}>
                          <span
                            className={styles.statusBadge}
                            data-active={user.isActive}
                          >
                            {user.isActive
                              ? t("users.active")
                              : t("users.inactive")}
                          </span>
                        </td>

                        <td data-label={t("users.actions")}>
                          <div className={styles.tableActions}>
                            <button
                              type="button"
                              onClick={() => openEditForm(user)}
                              aria-label={t("users.edit")}
                            >
                              <Pencil size={15} aria-hidden="true" />
                            </button>

                            <button
                              type="button"
                              className={
                                user.isActive
                                  ? styles.deactivateButton
                                  : styles.activateButton
                              }
                              onClick={() => handleStatusToggle(user)}
                              disabled={
                                isCurrentUser || statusMutation.isPending
                              }
                              aria-label={
                                user.isActive
                                  ? t("users.deactivate")
                                  : t("users.activate")
                              }
                            >
                              <Power size={15} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </AppLayout>
  );
}

export default Users;
