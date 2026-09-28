import { apiRequest } from "./apiClient";

// Recupera activos aplicando filtros, ordenación y paginación.
export const getAssets = async (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();

  const response = await apiRequest(`/assets${query ? `?${query}` : ""}`, {
    raw: true,
  });

  return {
    assets: response?.data ?? [],
    pagination: response?.pagination ?? null,
  };
};
