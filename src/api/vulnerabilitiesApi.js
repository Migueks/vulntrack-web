import { apiRequest } from "./apiClient";

// Recupera vulnerabilidades con filtros, ordenación y paginación.
export const getVulnerabilities = async (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();

  const response = await apiRequest(
    `/vulnerabilities${query ? `?${query}` : ""}`,
    { raw: true },
  );

  return {
    vulnerabilities: response?.data ?? [],
    pagination: response?.pagination ?? null,
  };
};

// Recupera una vulnerabilidad concreta.
export const getVulnerabilityById = async (id) => {
  return apiRequest(`/vulnerabilities/${id}`);
};
