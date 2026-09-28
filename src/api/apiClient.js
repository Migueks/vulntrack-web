const API_URL = import.meta.env.VITE_API_URL;

const TOKEN_STORAGE_KEY = "vulntrack-token";

// Recupera el JWT almacenado durante la sesión.
export const getToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

// Guarda el JWT después del login.
export const setToken = (token) => {
  sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
};

// Elimina el JWT al cerrar sesión.
export const removeToken = () => {
  try {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Evita interrumpir el cierre de sesión.
  }
};

// Representa un error devuelto por nuestra API.
export class ApiError extends Error {
  constructor(status, message) {
    super(message);

    this.name = "ApiError";
    this.status = status;
  }
}

// Cliente HTTP reutilizable para todas las peticiones.
export const apiRequest = async (
  endpoint,
  { method = "GET", body, headers = {}, auth = true, signal, raw = false } = {},
) => {
  const token = auth ? getToken() : null;

  const isFormData = body instanceof FormData;

  const requestHeaders = {
    ...headers,
  };

  // FormData necesita que el navegador genere su Content-Type.
  if (body !== undefined && !isFormData) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_URL}/${endpoint.replace(/^\/+/, "")}`, {
      method,
      headers: requestHeaders,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new ApiError(0, "Unable to connect to VulnTrack API.");
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    // Revoca la sesión local cuando Express rechaza el JWT.
    if (response.status === 401 && token && token === getToken()) {
      removeToken();

      window.dispatchEvent(new Event("vulntrack:unauthorized"));
    }

    throw new ApiError(
      response.status,
      payload?.message ?? "API request failed.",
    );
  }

  return raw ? payload : payload?.data;
};
