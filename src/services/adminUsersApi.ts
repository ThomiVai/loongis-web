const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000";

export type AdminUser = {
  _id: string;
  email: string;
  role:
    | "owner"
    | "manager";
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type Response<T> = {
  success: boolean;
  data: T;
  message?: string;
};

async function request<T>(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response =
    await fetch(
      `${API_URL}${path}`,
      {
        ...init,
        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${token}`,
        },
      },
    );

  const data =
    (await response.json()) as
      Response<T>;

  if (!response.ok) {
    throw new Error(
      data.message ??
        "No se pudo completar la operación.",
    );
  }

  return data.data;
}

export function getAdminUsers(
  token: string,
): Promise<AdminUser[]> {
  return request(
    token,
    "/api/admin-users",
  );
}

export function createAdminUser(
  token: string,
  data: {
    email: string;
    password: string;
    role:
      | "owner"
      | "manager";
  },
): Promise<AdminUser> {
  return request(
    token,
    "/api/admin-users",
    {
      method: "POST",
      body:
        JSON.stringify(data),
    },
  );
}

export function updateAdminUser(
  token: string,
  adminId: string,
  data: {
    role?:
      | "owner"
      | "manager";
    active?: boolean;
    newPassword?: string;
  },
): Promise<AdminUser> {
  return request(
    token,
    `/api/admin-users/${adminId}`,
    {
      method: "PATCH",
      body:
        JSON.stringify(data),
    },
  );
}
