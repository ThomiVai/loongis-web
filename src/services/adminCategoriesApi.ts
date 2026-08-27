const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000";

/* ========================================
   TIPOS
======================================== */

export type AdminCategory = {
  _id: string;
  name: string;
  slug: string;
  active: boolean;
  order: number;
};

type CategoriesResponse = {
  success: boolean;
  data: AdminCategory[];
  message?: string;
};

/* ========================================
   OBTENER CATEGORÍAS
======================================== */

export async function getAdminCategories():
  Promise<AdminCategory[]> {
  const response =
    await fetch(
      `${API_URL}/api/categories`,
    );

  const data:
    CategoriesResponse =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        "No se pudieron cargar las categorías.",
    );
  }

  return data.data;
}