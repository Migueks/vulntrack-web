import { Navigate, Route, Routes } from "react-router";

import ProtectedRoute from "../components/routes/ProtectedRoute";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Assets from "../pages/Assets/Assets";
import AssetDetail from "../pages/AssetDetail/AssetDetail";
import Vulnerabilities from "../pages/Vulnerabilities/Vulnerabilities";
import VulnerabilityDetail from "../pages/VulnerabilityDetail/VulnerabilityDetail";
import Findings from "../pages/Findings/Findings";
import FindingDetail from "../pages/FindingDetail/FindingDetail";
import Users from "../pages/Users/Users";

function AppRouter() {
  return (
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

      {/* Detalles del activo */}
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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
