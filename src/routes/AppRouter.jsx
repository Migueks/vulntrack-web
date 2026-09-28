import { Navigate, Route, Routes } from "react-router";

import ProtectedRoute from "../components/routes/ProtectedRoute";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Assets from "../pages/Assets/Assets";

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

      {/* Ruta desconocida */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
