import {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  getCurrentAdmin,
} from "../services/adminAuthApi";

import type {
  Admin,
} from "../services/adminAuthApi";

import {
  getAdminToken,
  removeAdminToken,
} from "../utils/adminSession";

/* ========================================
   TIPOS
======================================== */

type AdminRouteStatus =
  | "checking"
  | "authorized"
  | "unauthorized";

export type ProtectedAdminOutletContext = {
  admin: Admin;
};

/* ========================================
   COMPONENTE
======================================== */

export function ProtectedAdminRoute() {
  const token =
    getAdminToken();

  const [
    status,
    setStatus,
  ] =
    useState<AdminRouteStatus>(
      "checking",
    );

  const [
    admin,
    setAdmin,
  ] =
    useState<Admin | null>(
      null,
    );

  /* ========================================
     VERIFICAR SESIÓN
  ======================================== */

  useEffect(() => {
    if (!token) {
      return;
    }

    const currentToken =
      token;

    let mounted =
      true;

    async function verifySession() {
      try {
        const currentAdmin =
          await getCurrentAdmin(
            currentToken,
          );

        if (!mounted) {
          return;
        }

        setAdmin(
          currentAdmin,
        );

        setStatus(
          "authorized",
        );
      } catch {
        removeAdminToken();

        if (!mounted) {
          return;
        }

        setAdmin(null);

        setStatus(
          "unauthorized",
        );
      }
    }

    void verifySession();

    return () => {
      mounted = false;
    };
  }, [token]);

  /* ========================================
     SIN TOKEN
  ======================================== */

  if (!token) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  /* ========================================
     VERIFICANDO SESIÓN
  ======================================== */

  if (
    status === "checking"
  ) {
    return (
      <main
        style={{
          minHeight:
            "100vh",

          display:
            "grid",

          placeItems:
            "center",

          background:
            "var(--color-cream)",
        }}
      >
        <p
          style={{
            fontFamily:
              '"Fredoka", sans-serif',

            fontSize:
              "20px",

            fontWeight:
              600,
          }}
        >
          Verificando sesión...
        </p>
      </main>
    );
  }

  /* ========================================
     NO AUTORIZADO
  ======================================== */

  if (
    status ===
      "unauthorized" ||
    !admin
  ) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  /* ========================================
     AUTORIZADO
  ======================================== */

  return (
    <Outlet
      context={{
        admin,
      }}
    />
  );
}