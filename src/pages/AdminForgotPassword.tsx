import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

import { requestAdminPasswordReset } from "../services/adminAuthApi";
import "../styles/AdminLogin.css";

export function AdminForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      setMessage(await requestAdminPasswordReset(email));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo procesar la solicitud.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login">
      <div className="admin-login__card">
        <span className="admin-login__eyebrow">Loongis</span>
        <h1 className="admin-login__title">Recuperar contraseña</h1>
        <p className="admin-login__description">
          Ingresá el email de tu cuenta y te enviaremos un enlace para crear una nueva clave.
        </p>

        <form
          className="admin-login__form"
          onSubmit={handleSubmit}
        >
          <label className="admin-login__field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              maxLength={254}
              required
              disabled={loading || Boolean(message)}
            />
          </label>

          {error && (
            <p className="admin-login__error" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="admin-login__success" role="status">
              {message}
            </p>
          )}

          {!message && (
            <button
              className="admin-login__button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>
          )}
        </form>

        <Link className="admin-login__back" to="/admin/login">
          Volver al inicio de sesión
        </Link>
      </div>
    </main>
  );
}
