import { apiRequest } from "./apiClient";

// Recupera usuarios para las operaciones administrativas.
export const getUsers = async () => {
  const response = await apiRequest("/users?page=1&limit=100", {
    raw: true,
  });

  return response?.data ?? [];
};
