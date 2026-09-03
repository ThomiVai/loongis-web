import {
  clearProductsCache,
} from "./productsApi";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000";

/* ========================================
   TIPOS
======================================== */

export type AdminProductCategory = {
  _id: string;
  name: string;
  slug: string;
  active: boolean;
  order: number;
};

export type AdminProductOption = {
  id: string;
  name: string;
  label: string;
  priceModifier: number;
};

export type DailyComboBurgerId =
  | "solo-queso"
  | "clasic"
  | "bacon"
  | "crispy";

export type AdminProduct = {
  _id: string;
  legacyId?: number;

  name: string;
  slug: string;
  description: string;
  price: number;

  image: string;
  imageAlt: string;

  category:
    | AdminProductCategory
    | null;

  featured: boolean;
  dailyPromo: boolean;
  active: boolean;

  order: number;

  sizes: AdminProductOption[];
  extras: AdminProductOption[];
  ingredients: string[];
  dailyComboBurgerId?:
    DailyComboBurgerId;

  createdAt?: string;
  updatedAt?: string;
};

/* ========================================
   DATOS PARA CREAR
======================================== */

export type CreateAdminProductData = {
  legacyId: number;

  name: string;
  description: string;
  price: number;

  image: string;
  imageAlt: string;

  category: string;

  featured: boolean;
  dailyPromo: boolean;
  active: boolean;

  order: number;

  sizes: AdminProductOption[];
  extras: AdminProductOption[];
  ingredients: string[];
};

/* ========================================
   DATOS PARA ACTUALIZAR
======================================== */

export type UpdateAdminProductData = {
  name?: string;
  description?: string;
  price?: number;

  image?: string;
  imageAlt?: string;

  category?: string;

  featured?: boolean;
  dailyPromo?: boolean;
  active?: boolean;

  order?: number;

  sizes?: AdminProductOption[];
  extras?: AdminProductOption[];
  ingredients?: string[];
  dailyComboBurgerId?:
    DailyComboBurgerId;
};

/* ========================================
   RESPUESTAS API
======================================== */

type ProductsResponse = {
  success: boolean;
  data: AdminProduct[];
  message?: string;
};

type ProductResponse = {
  success: boolean;
  data: AdminProduct;
  message?: string;
};

type DeleteProductResponse = {
  success: boolean;
  message?: string;
};

/* ========================================
   OBTENER PRODUCTOS
======================================== */

export async function getAdminProducts():
  Promise<AdminProduct[]> {
  const response =
    await fetch(
      `${API_URL}/api/products`,
    );

  const data:
    ProductsResponse =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        "No se pudieron cargar los productos.",
    );
  }

  return data.data;
}

/* ========================================
   OBTENER PRODUCTO
======================================== */

export async function getAdminProductById(
  productId: string,
): Promise<AdminProduct> {
  const response =
    await fetch(
      `${API_URL}/api/products/${productId}`,
    );

  const data:
    ProductResponse =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        "No se pudo cargar el producto.",
    );
  }

  return data.data;
}

/* ========================================
   CREAR PRODUCTO
======================================== */

export async function createAdminProduct(
  token: string,
  productData:
    CreateAdminProductData,
): Promise<AdminProduct> {
  const response =
    await fetch(
      `${API_URL}/api/products`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body:
          JSON.stringify(
            productData,
          ),
      },
    );

  const data:
    ProductResponse =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        "No se pudo crear el producto.",
    );
  }

  clearProductsCache();

  return data.data;
}

/* ========================================
   ACTUALIZAR PRODUCTO
======================================== */

export async function updateAdminProduct(
  productId: string,
  token: string,
  productData:
    UpdateAdminProductData,
): Promise<AdminProduct> {
  const response =
    await fetch(
      `${API_URL}/api/products/${productId}`,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body:
          JSON.stringify(
            productData,
          ),
      },
    );

  const data:
    ProductResponse =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        "No se pudo actualizar el producto.",
    );
  }

  clearProductsCache();

  return data.data;
}

/* ========================================
   ELIMINAR PRODUCTO
======================================== */

export async function deleteAdminProduct(
  productId: string,
  token: string,
): Promise<void> {
  const response =
    await fetch(
      `${API_URL}/api/products/${productId}`,
      {
        method: "DELETE",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      },
    );

  if (response.ok) {
    clearProductsCache();
    return;
  }

  let message =
    "No se pudo eliminar el producto.";

  try {
    const data =
      (await response.json()) as
        DeleteProductResponse;

    if (data.message) {
      message =
        data.message;
    }
  } catch {
    // La API no devolvió JSON.
    // Conservamos el mensaje genérico.
  }

  throw new Error(
    message,
  );
}
