import { Navigate, Route, Routes } from "react-router";

import ProtectedRoute from "../components/routes/ProtectedRoute";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";

// Navegación principal de VulnTrack.
function AppRouter() {
  return (
    <Routes>
      {/* Página pública */}

      <Route path="/" element={<Home />} />

      {/* Inicio de sesión */}

      <Route path="/login" element={<Login />} />

      {/* Dashboard privado */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Rutas desconocidas */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
