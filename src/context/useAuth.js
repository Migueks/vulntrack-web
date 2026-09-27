import { useContext } from "react";

import { AuthContext } from "./authContext";

// Permite utilizar la autenticación desde cualquier componente.
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
};
