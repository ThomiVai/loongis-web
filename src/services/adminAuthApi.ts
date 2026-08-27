const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000";

/* ========================================
   TIPOS
======================================== */

export type Admin = {
  id: string;
  email: string;
  role: "admin";
};

type LoginResponse = {
  success: boolean;
  message: string;
  token: string;
  admin: Admin;
};

type CurrentAdminResponse = {
  success: boolean;
  data: Admin;
};

/* ========================================
   LOGIN
======================================== */

export async function loginAdmin(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response =
    await fetch(
      `${API_URL}/api/auth/login`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      },
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        "No se pudo iniciar sesión.",
    );
  }

  return data;
}

/* ========================================
   ADMIN ACTUAL
======================================== */

export async function getCurrentAdmin(
  token: string,
): Promise<Admin> {
  const response =
    await fetch(
      `${API_URL}/api/auth/me`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      },
    );

  const data:
    CurrentAdminResponse & {
      message?: string;
    } =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        "La sesión no es válida.",
    );
  }

  return data.data;
}