import { apiRequest } from "./apiClient";

// Inicia sesión con email y contraseña.
export const loginRequest = (credentials) =>
  apiRequest("/auth/login", {
    method: "POST",
    body: credentials,
    auth: false,
  });

// Recupera el usuario autenticado.
export const getCurrentUser = (signal) =>
  apiRequest("/auth/me", {
    signal,
  });
