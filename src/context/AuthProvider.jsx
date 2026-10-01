import { useEffect, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { AuthContext } from "./authContext";

import { getToken, removeToken, setToken } from "../api/apiClient";

import { getCurrentUser, loginRequest } from "../api/authApi";

function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  const [user, setUser] = useState(null);

  // Si existe un JWT, comprobamos la sesión al iniciar React.
  const [checkingSession, setCheckingSession] = useState(() =>
    Boolean(getToken()),
  );

  // Recupera el usuario cuando se actualiza la página.
  useEffect(() => {
    const initialToken = getToken();

    if (!initialToken) {
      return;
    }

    const controller = new AbortController();

    const restoreSession = async () => {
      try {
        const currentUser = await getCurrentUser(controller.signal);

        if (!controller.signal.aborted && getToken() === initialToken) {
          setUser(currentUser);
        }
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        if (!controller.signal.aborted) {
          setUser(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setCheckingSession(false);
        }
      }
    };

    void restoreSession();

    return () => {
      controller.abort();
    };
  }, []);

  // Reacciona cuando Express rechaza un JWT caducado o revocado.
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setCheckingSession(false);

      queryClient.clear();
    };

    window.addEventListener("vulntrack:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("vulntrack:unauthorized", handleUnauthorized);
    };
  }, [queryClient]);

  // Actualiza los datos del usuario autenticado.
  const refreshUser = async () => {
    const currentUser = await getCurrentUser();

    setUser(currentUser);

    return currentUser;
  };

  // Inicia sesión y conserva el JWT.
  const login = async (credentials) => {
    const data = await loginRequest(credentials);

    setToken(data.token);

    queryClient.clear();

    setUser(data.user);
    setCheckingSession(false);

    return data.user;
  };

  // Cierra sesión y limpia los datos privados.
  const logout = () => {
    removeToken();

    setUser(null);
    setCheckingSession(false);

    queryClient.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        checkingSession,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
