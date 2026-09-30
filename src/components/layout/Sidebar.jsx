import {
  ClipboardList,
  Database,
  LayoutDashboard,
  ShieldAlert,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../context/useAuth";

import styles from "./Sidebar.module.css";

const AVAILABLE_MODULES = [
  {
    key: "dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    key: "assets",
    icon: Database,
    path: "/assets",
  },
  {
    key: "vulnerabilities",
    icon: ShieldAlert,
    path: "/vulnerabilities",
  },
  {
    key: "findings",
    icon: ClipboardList,
    path: "/findings",
  },
];

const UPCOMING_MODULES = [];

function Sidebar({ isOpen, onNavigate }) {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <aside
      id="vulntrack-sidebar"
      className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}
    >
      {/* Identidad */}

      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <ShieldCheck size={23} strokeWidth={2} aria-hidden="true" />
        </div>

        <span className={styles.brandName}>
          VULNTRACK<span>.</span>
        </span>
      </div>

      {/* Navegación */}

      <nav className={styles.navigation} aria-label={t("navigation.title")}>
        <span className={styles.sectionTitle}>{t("navigation.title")}</span>

        {AVAILABLE_MODULES.map((module) => {
          const Icon = module.icon;

          return (
            <NavLink
              key={module.key}
              to={module.path}
              end
              onClick={onNavigate}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              <Icon size={19} aria-hidden="true" />

              <span>{t(`navigation.${module.key}`)}</span>
            </NavLink>
          );
        })}

        {/* Administración */}

        {user?.role === "ADMIN" && (
          <NavLink
            to="/users"
            end
            onClick={onNavigate}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
          >
            <UsersRound size={19} aria-hidden="true" />

            <span>{t("navigation.users")}</span>
          </NavLink>
        )}

        {/* Próximamente */}

        {UPCOMING_MODULES.map((module) => {
          const Icon = module.icon;

          return (
            <div
              key={module.key}
              className={`${styles.navItem} ${styles.disabled}`}
              aria-disabled="true"
            >
              <Icon size={19} aria-hidden="true" />

              <span>{t(`navigation.${module.key}`)}</span>

              <span className={styles.comingSoon}>
                {t("navigation.comingSoon")}
              </span>
            </div>
          );
        })}
      </nav>

      {/* Usuario */}

      <div className={styles.footer}>
        <div className={styles.avatar}>
          {user?.name?.charAt(0).toUpperCase() ?? "V"}
        </div>

        <div className={styles.userInfo}>
          <strong>{user?.name}</strong>

          <span>{t(`roles.${user?.role}`)}</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
