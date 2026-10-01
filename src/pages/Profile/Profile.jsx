import { useState } from "react";

import { KeyRound, Save, UserRound } from "lucide-react";

import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { changeMyPassword, updateMyProfile } from "../../api/usersApi";

import AppLayout from "../../components/layout/AppLayout";
import { useAuth } from "../../context/useAuth";

import styles from "./Profile.module.css";

function Profile() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { user, refreshUser, logout } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    confirmEmail: user?.email ?? "",
  });

  const [profileClientError, setProfileClientError] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordClientError, setPasswordClientError] = useState("");

  const profileMutation = useMutation({
    mutationFn: () =>
      updateMyProfile({
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
      }),

    onSuccess: async () => {
      await refreshUser();

      setProfileSuccess(t("profile.profileSuccess"));
    },
  });

  const passwordMutation = useMutation({
    mutationFn: () =>
      changeMyPassword(passwordForm.currentPassword, passwordForm.newPassword),

    // El backend invalida el JWT después del cambio.
    onSuccess: () => {
      logout();

      navigate("/login", {
        replace: true,
        state: {
          passwordChanged: true,
        },
      });
    },
  });

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileSuccess("");
    setProfileClientError("");
    profileMutation.reset();

    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordClientError("");
    passwordMutation.reset();

    setPasswordForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleProfileSubmit = (event) => {
    event.preventDefault();

    setProfileSuccess("");
    setProfileClientError("");

    if (
      profileForm.email.trim().toLowerCase() !==
      profileForm.confirmEmail.trim().toLowerCase()
    ) {
      setProfileClientError(t("profile.emailMismatch"));

      return;
    }

    profileMutation.mutate();
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();

    setPasswordClientError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordClientError(t("profile.passwordMismatch"));

      return;
    }

    passwordMutation.mutate();
  };

  const getProfileError = () => {
    if (!profileMutation.isError) {
      return null;
    }

    if (profileMutation.error?.status === 409) {
      return t("profile.emailInUse");
    }

    return t("profile.error");
  };

  const getPasswordError = () => {
    if (passwordClientError) {
      return passwordClientError;
    }

    if (!passwordMutation.isError) {
      return null;
    }

    const message = passwordMutation.error?.message ?? "";

    if (message === "Current password is incorrect.") {
      return t("profile.currentPasswordIncorrect");
    }

    if (
      message === "New password must be different from the current password."
    ) {
      return t("profile.samePassword");
    }

    return t("profile.error");
  };

  return (
    <AppLayout>
      {/* Encabezado */}

      <div className={styles.heading}>
        <span className={styles.eyebrow}>
          <UserRound size={16} aria-hidden="true" />

          {t("profile.eyebrow")}
        </span>

        <h1>{t("profile.title")}</h1>

        <p>{t("profile.description")}</p>
      </div>

      <div className={styles.grid}>
        {/* Datos personales */}

        <section className={styles.card}>
          <div className={styles.cardHeading}>
            <UserRound size={20} aria-hidden="true" />

            <div>
              <h2>{t("profile.personalData")}</h2>

              <p>{t("profile.personalDataDescription")}</p>
            </div>
          </div>

          <div className={styles.accountInfo}>
            <div>
              <span>{t("profile.userCode")}</span>
              <strong>{user?.userCode}</strong>
            </div>

            <div>
              <span>{t("profile.role")}</span>
              <strong>{t(`roles.${user?.role}`)}</strong>
            </div>
          </div>

          <form className={styles.form} onSubmit={handleProfileSubmit}>
            <label>
              <span>{t("profile.name")}</span>

              <input
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                minLength={2}
                maxLength={100}
                required
              />
            </label>

            <div className={styles.emailRow}>
              <label>
                <span>{t("profile.email")}</span>

                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  required
                />
              </label>

              <label>
                <span>{t("profile.confirmEmail")}</span>

                <input
                  type="email"
                  name="confirmEmail"
                  autoComplete="email"
                  value={profileForm.confirmEmail}
                  onChange={handleProfileChange}
                  required
                />
              </label>
            </div>

            {profileClientError && (
              <p className={styles.error} role="alert">
                {profileClientError}
              </p>
            )}

            {profileSuccess && (
              <p className={styles.success} role="status">
                {profileSuccess}
              </p>
            )}

            {profileMutation.isError && (
              <p className={styles.error} role="alert">
                {getProfileError()}
              </p>
            )}

            <button
              type="submit"
              className={styles.primaryButton}
              disabled={profileMutation.isPending}
            >
              <Save size={16} aria-hidden="true" />

              {t("profile.saveProfile")}
            </button>
          </form>
        </section>

        {/* Contraseña */}

        <section className={styles.card}>
          <div className={styles.cardHeading}>
            <KeyRound size={20} aria-hidden="true" />

            <div>
              <h2>{t("profile.security")}</h2>

              <p>{t("profile.securityDescription")}</p>
            </div>
          </div>

          <form className={styles.form} onSubmit={handlePasswordSubmit}>
            <label>
              <span>{t("profile.currentPassword")}</span>

              <input
                type="password"
                name="currentPassword"
                autoComplete="current-password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </label>

            <label>
              <span>{t("profile.newPassword")}</span>

              <input
                type="password"
                name="newPassword"
                autoComplete="new-password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                minLength={15}
                required
              />

              <small>{t("profile.passwordHelp")}</small>
            </label>

            <label>
              <span>{t("profile.confirmPassword")}</span>

              <input
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                minLength={15}
                required
              />
            </label>

            {getPasswordError() && (
              <p className={styles.error} role="alert">
                {getPasswordError()}
              </p>
            )}

            <button
              type="submit"
              className={styles.primaryButton}
              disabled={passwordMutation.isPending}
            >
              <KeyRound size={16} aria-hidden="true" />

              {t("profile.changePassword")}
            </button>
          </form>
        </section>
      </div>
    </AppLayout>
  );
}

export default Profile;
