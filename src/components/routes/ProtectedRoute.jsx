import { Navigate, useLocation } from "react-router";

import { useTranslation } from "react-i18next";

import { useAuth } from "../../context/useAuth";

import styles from "./ProtectedRoute.module.css";

// Impide mostrar páginas privadas sin una sesión válida.
function ProtectedRoute({ children, allowedRoles }) {
  const { t } = useTranslation();

  const { user, isAuthenticated, checkingSession } = useAuth();

  const location = useLocation();

  if (checkingSession) {
    return (
      <main className={styles.loadingPage}>
        <p className={styles.loadingMessage} role="status">
          {t("common.checkingSession")}
        </p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Impide acceder desde el frontend a módulos no permitidos.
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
