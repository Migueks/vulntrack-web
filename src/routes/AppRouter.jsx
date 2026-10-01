import { lazy, Suspense } from "react";

import { Route, Routes } from "react-router";

import { useTranslation } from "react-i18next";

import ProtectedRoute from "../components/routes/ProtectedRoute";

import styles from "./AppRouter.module.css";

// Las páginas se descargan únicamente cuando se necesitan.
const Home = lazy(() => import("../pages/Home/Home"));

const Login = lazy(() => import("../pages/Login/Login"));

const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));

const Assets = lazy(() => import("../pages/Assets/Assets"));

const AssetDetail = lazy(() => import("../pages/AssetDetail/AssetDetail"));

const Vulnerabilities = lazy(
  () => import("../pages/Vulnerabilities/Vulnerabilities"),
);

const VulnerabilityDetail = lazy(
  () => import("../pages/VulnerabilityDetail/VulnerabilityDetail"),
);

const Findings = lazy(() => import("../pages/Findings/Findings"));

const FindingDetail = lazy(
  () => import("../pages/FindingDetail/FindingDetail"),
);

const Users = lazy(() => import("../pages/Users/Users"));

const NotFound = lazy(() => import("../pages/NotFound/NotFound"));

function AppRouter() {
  const { t } = useTranslation();

  return (
    <Suspense
      fallback={
        <main className={styles.loadingPage}>
          <p className={styles.loadingMessage} role="status">
            {t("common.loading")}
          </p>
        </main>
      }
    >
      <Routes>
        {/* Página pública */}

        <Route path="/" element={<Home />} />

        {/* Login */}

        <Route path="/login" element={<Login />} />

        {/* Dashboard */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Activos */}

        <Route
          path="/assets"
          element={
            <ProtectedRoute>
              <Assets />
            </ProtectedRoute>
          }
        />

        {/* Detalle del activo */}

        <Route
          path="/assets/:id"
          element={
            <ProtectedRoute>
              <AssetDetail />
            </ProtectedRoute>
          }
        />

        {/* Vulnerabilidades */}

        <Route
          path="/vulnerabilities"
          element={
            <ProtectedRoute>
              <Vulnerabilities />
            </ProtectedRoute>
          }
        />

        {/* Detalle de vulnerabilidad */}

        <Route
          path="/vulnerabilities/:id"
          element={
            <ProtectedRoute>
              <VulnerabilityDetail />
            </ProtectedRoute>
          }
        />

        {/* Hallazgos */}

        <Route
          path="/findings"
          element={
            <ProtectedRoute>
              <Findings />
            </ProtectedRoute>
          }
        />

        {/* Detalle de hallazgo */}

        <Route
          path="/findings/:id"
          element={
            <ProtectedRoute>
              <FindingDetail />
            </ProtectedRoute>
          }
        />

        {/* Administración de usuarios */}

        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Users />
            </ProtectedRoute>
          }
        />

        {/* Ruta desconocida */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default AppRouter;
