import { useState } from "react";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { Link, Navigate, useLocation, useNavigate } from "react-router";

import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import LanguageSwitcher from "../../components/common/LanguageSwitcher/LanguageSwitcher";
import { useAuth } from "../../context/useAuth";

import styles from "./Login.module.css";

function Login() {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const location = useLocation();

  const { login, isAuthenticated, checkingSession } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // TanStack Query gestiona el envío y los errores del login.
  const loginMutation = useMutation({
    mutationFn: login,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await loginMutation.mutateAsync({
        email: email.trim(),
        password,
      });

      // Vuelve a la ruta solicitada antes del login.
      const destination = location.state?.from?.pathname ?? "/dashboard";

      navigate(destination, {
        replace: true,
      });
    } catch {
      // El error se muestra mediante loginMutation.error.
    }
  };

  // Traduce los errores HTTP sin mostrar información interna.
  const getErrorMessage = () => {
    const error = loginMutation.error;

    if (!error) {
      return null;
    }

    if (error.status === 401) {
      return t("errors.invalidCredentials");
    }

    if (error.status === 429) {
      return t("errors.tooManyRequests");
    }

    if (error.status === 0) {
      return t("errors.connection");
    }

    return t("errors.generic");
  };

  // Espera mientras se recupera una sesión guardada.
  if (checkingSession) {
    return (
      <main className={styles.page}>
        <p className={styles.loading}>{t("common.checkingSession")}</p>
      </main>
    );
  }

  // Evita mostrar el login a usuarios autenticados.
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />

      {/* Cabecera */}

      <header className={styles.header}>
        <Link to="/" className={styles.brand} aria-label="VulnTrack">
          <ShieldCheck size={28} strokeWidth={2} aria-hidden="true" />

          <span>
            VULNTRACK<span>.</span>
          </span>
        </Link>

        <LanguageSwitcher />
      </header>

      {/* Formulario */}

      <section className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <LockKeyhole size={27} strokeWidth={1.8} aria-hidden="true" />
          </div>

          <h1 className={styles.title}>{t("login.title")}</h1>

          <p className={styles.subtitle}>{t("login.subtitle")}</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            {/* Correo electrónico */}

            <div className={styles.field}>
              <label htmlFor="email">{t("login.email")}</label>

              <div className={styles.inputWrapper}>
                <Mail size={18} aria-hidden="true" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nombre@empresa.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={loginMutation.isPending}
                />
              </div>
            </div>

            {/* Contraseña */}

            <div className={styles.field}>
              <label htmlFor="password">{t("login.password")}</label>

              <div className={styles.inputWrapper}>
                <LockKeyhole size={18} aria-hidden="true" />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={loginMutation.isPending}
                />

                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={
                    showPassword
                      ? t("login.hidePassword")
                      : t("login.showPassword")
                  }
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error de autenticación */}

            {loginMutation.isError && (
              <div className={styles.error} role="alert">
                {getErrorMessage()}
              </div>
            )}

            {/* Envío */}

            <button
              type="submit"
              className={styles.submit}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending
                ? t("login.submitting")
                : t("login.submit")}
            </button>
          </form>

          <Link to="/" className={styles.backLink}>
            <ArrowLeft size={16} aria-hidden="true" />

            {t("login.back")}
          </Link>
        </div>
      </section>

      <footer className={styles.footer}>VULNTRACK © 2026</footer>
    </main>
  );
}

export default Login;
