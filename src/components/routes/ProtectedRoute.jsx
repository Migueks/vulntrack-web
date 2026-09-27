import { Navigate, useLocation } from "react-router";

import { useTranslation } from "react-i18next";

import { useAuth } from "../../context/useAuth";

import styles from "./ProtectedRoute.module.css";

// Impide mostrar páginas privadas sin una sesión válida.
function ProtectedRoute({ children }) {
  const { t } = useTranslation();

  const { isAuthenticated, checkingSession } = useAuth();

  const location = useLocation();

  // Espera mientras Express comprueba el JWT guardado.
  if (checkingSession) {
    return (
      <main className={styles.loadingPage}>
        <p className={styles.loadingMessage} role="status">
          {t("common.checkingSession")}
        </p>
      </main>
    );
  }

  // Si no existe sesión, redirige al Login.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
