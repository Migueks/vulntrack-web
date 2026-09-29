import { apiRequest } from "./apiClient";

// Recupera hallazgos con filtros, ordenación y paginación.
export const getFindings = async (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();

  const response = await apiRequest(`/findings${query ? `?${query}` : ""}`, {
    raw: true,
  });

  return {
    findings: response?.data ?? [],
    pagination: response?.pagination ?? null,
  };
};

// Recupera el detalle completo de un hallazgo.
export const getFindingById = async (id) => {
  return apiRequest(`/findings/${id}`);
};
