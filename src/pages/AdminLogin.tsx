import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  loginAdmin,
} from "../services/adminAuthApi";

import {
  getAdminToken,
  saveAdminToken,
} from "../utils/adminSession";

import "../styles/AdminLogin.css";

export function AdminLogin() {
  const navigate =
    useNavigate();

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  /* ========================================
     YA HAY SESIÓN
  ======================================== */

  const existingToken =
    getAdminToken();

  if (existingToken) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  /* ========================================
     LOGIN
  ======================================== */

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      setError(null);
      setLoading(true);

      try {
        const response =
          await loginAdmin(
            email,
            password,
          );

        saveAdminToken(
          response.token,
        );

        navigate(
          "/admin",
          {
            replace: true,
          },
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "No se pudo iniciar sesión.",
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <main className="admin-login">
      <div className="admin-login__card">

        {/* ========================================
            ENCABEZADO
        ======================================== */}

        <span className="admin-login__eyebrow">
          Loongis
        </span>

        <h1 className="admin-login__title">
          Panel administrador
        </h1>

        <p className="admin-login__description">
          Iniciá sesión para
          administrar el catálogo.
        </p>

        {/* ========================================
            FORMULARIO
        ======================================== */}

        <form
          className="admin-login__form"
          onSubmit={
            handleSubmit
          }
        >
          <label className="admin-login__field">
            <span>
              Email
            </span>

            <input
              type="email"
              value={email}
              onChange={(
                event,
              ) =>
                setEmail(
                  event.target
                    .value,
                )
              }
              autoComplete="email"
              required
              disabled={
                loading
              }
            />
          </label>

          <label className="admin-login__field">
            <span>
              Contraseña
            </span>

            <input
              type="password"
              value={
                password
              }
              onChange={(
                event,
              ) =>
                setPassword(
                  event.target
                    .value,
                )
              }
              autoComplete="current-password"
              required
              disabled={
                loading
              }
            />
          </label>

          {error && (
            <p
              className="admin-login__error"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            className="admin-login__button"
            type="submit"
            disabled={
              loading
            }
          >
            {loading
              ? "Ingresando..."
              : "Ingresar"}
          </button>
        </form>

        {/* ========================================
            VOLVER A LA TIENDA
        ======================================== */}

        <Link
          className="admin-login__back"
          to="/"
        >
          <span
            aria-hidden="true"
          >
            ←
          </span>

          <span>
            Volver a la tienda
          </span>
        </Link>
      </div>
    </main>
  );
}