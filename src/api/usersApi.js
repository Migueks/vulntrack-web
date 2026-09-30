import { apiRequest } from "./apiClient";

// Recupera usuarios con filtros y paginación.
export const getUsers = async (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();

  const response = await apiRequest(`/users${query ? `?${query}` : ""}`, {
    raw: true,
  });

  return {
    users: response?.data ?? [],
    pagination: response?.pagination ?? null,
  };
};

// Recupera un usuario concreto.
export const getUserById = async (id) => {
  return apiRequest(`/users/${id}`);
};

// Crea un usuario desde el panel de administración.
export const createUser = async (data) => {
  return apiRequest("/users", {
    method: "POST",
    body: data,
  });
};

// Actualiza los datos editables de un usuario.
export const updateUser = async (id, data) => {
  return apiRequest(`/users/${id}`, {
    method: "PATCH",
    body: data,
  });
};

// Activa o desactiva una cuenta.
export const updateUserStatus = async (id, isActive) => {
  return apiRequest(`/users/${id}/status`, {
    method: "PATCH",
    body: { isActive },
  });
};
