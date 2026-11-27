import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";

import { resetAdminPassword } from "../services/adminAuthApi";
import "../styles/AdminLogin.css";

export function AdminResetPassword() {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await resetAdminPassword(token, newPassword);
      setUpdated(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo actualizar la contraseña.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login">
      <div className="admin-login__card">
        <span className="admin-login__eyebrow">Loongis</span>
        <h1 className="admin-login__title">Nueva contraseña</h1>

        {!token ? (
          <>
            <p className="admin-login__description">
              El enlace no es válido. Solicitá uno nuevo para continuar.
            </p>
            <Link
              className="admin-login__back"
              to="/admin/forgot-password"
            >
              Solicitar otro enlace
            </Link>
          </>
        ) : updated ? (
          <>
            <p className="admin-login__success" role="status">
              La contraseña se actualizó. Ya podés ingresar al panel.
            </p>
            <Link className="admin-login__back" to="/admin/login">
              Ir al inicio de sesión
            </Link>
          </>
        ) : (
          <>
            <p className="admin-login__description">
              Elegí una contraseña nueva de al menos 10 caracteres.
            </p>
            <form
              className="admin-login__form"
              onSubmit={handleSubmit}
            >
              <label className="admin-login__field">
                <span>Nueva contraseña</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={10}
                  maxLength={128}
                  required
                  disabled={loading}
                />
              </label>

              <label className="admin-login__field">
                <span>Repetí la nueva contraseña</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={10}
                  maxLength={128}
                  required
                  disabled={loading}
                />
              </label>

              {error && (
                <p className="admin-login__error" role="alert">
                  {error}
                </p>
              )}

              <button
                className="admin-login__button"
                type="submit"
                disabled={loading}
              >
                {loading ? "Actualizando..." : "Guardar contraseña"}
              </button>
            </form>
          </>
        )}

        {!updated && token && (
          <Link className="admin-login__back" to="/admin/login">
            Volver al inicio de sesión
          </Link>
        )}
      </div>
    </main>
  );
}
