import { LogOut, Menu, ShieldCheck } from "lucide-react";

import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router";

import { useTranslation } from "react-i18next";

import LanguageSwitcher from "../common/LanguageSwitcher/LanguageSwitcher";

import { useAuth } from "../../context/useAuth";

import Sidebar from "./Sidebar";

import styles from "./AppLayout.module.css";

function AppLayout({ children }) {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Permite cerrar el menú móvil pulsando Escape.
  useEffect(() => {
    if (!sidebarOpen) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={styles.shell}>
      {/* Fondo del menú móvil */}

      <a href="#main-content" className={styles.skipLink}>
        {t("layout.skipToContent")}
      </a>

      {sidebarOpen && (
        <button
          type="button"
          className={styles.overlay}
          onClick={closeSidebar}
          aria-label={t("layout.closeMenu")}
        />
      )}

      {/* Navegación lateral */}

      <Sidebar isOpen={sidebarOpen} onNavigate={closeSidebar} />

      {/* Zona principal */}

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerStart}>
            <button
              type="button"
              className={styles.menuButton}
              onClick={() => setSidebarOpen((current) => !current)}
              aria-label={t("layout.openMenu")}
              aria-controls="vulntrack-sidebar"
              aria-expanded={sidebarOpen}
            >
              <Menu size={21} aria-hidden="true" />
            </button>

            <Link
              to="/dashboard"
              className={styles.mobileBrand}
              aria-label="VulnTrack"
            >
              <ShieldCheck size={23} aria-hidden="true" />

              <span>
                VULNTRACK<span>.</span>
              </span>
            </Link>

            <span className={styles.workspace}>{t("layout.workspace")}</span>
          </div>

          <div className={styles.headerActions}>
            <LanguageSwitcher />

            <button
              type="button"
              className={styles.logout}
              onClick={handleLogout}
              aria-label={t("dashboard.logout")}
              title={t("dashboard.logout")}
            >
              <LogOut size={17} aria-hidden="true" />

              <span>{t("dashboard.logout")}</span>
            </button>
          </div>
        </header>

        <main id="main-content" className={styles.content} tabIndex="-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
