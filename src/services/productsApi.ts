import type {
  Product,
  ProductCategory,
  ProductOption,
} from "../types/Product";

/* ========================================
   CONFIGURACIÓN
======================================== */

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000";

/* ========================================
   TIPOS DE LA API
======================================== */

type ApiCategory = {
  _id: string;
  name: string;
  slug: string;
  active: boolean;
  order: number;
};

type ApiProductOption = {
  id: string;
  name: string;
  label?: string;
  priceModifier: number;
};

type ApiProduct = {
  _id: string;

  legacyId?: number;

  name: string;
  slug: string;

  description: string;
  price: number;

  image: string;
  imageAlt: string;

  category:
    | ApiCategory
    | string;

  featured: boolean;
  active: boolean;
  order: number;

  sizes: ApiProductOption[];
  extras: ApiProductOption[];
  ingredients: string[];
};

type ApiProductsResponse = {
  success: boolean;
  data: ApiProduct[];
};

type ApiProductResponse = {
  success: boolean;
  data: ApiProduct;
};

/* ========================================
   CATEGORÍAS
======================================== */

function getProductCategory(
  category:
    | ApiCategory
    | string,
): ProductCategory | undefined {
  if (
    typeof category === "string"
  ) {
    return undefined;
  }

  const slug =
    category.slug;

  if (
    slug === "hamburguesas" ||
    slug === "combos" ||
    slug === "papas" ||
    slug === "bebidas" ||
    slug === "postres"
  ) {
    return slug;
  }

  return undefined;
}

/* ========================================
   OPCIONES
======================================== */

function mapOption(
  option: ApiProductOption,
): ProductOption {
  return {
    id: option.id,
    name: option.name,
    label:
      option.label,
    priceModifier:
      option.priceModifier,
  };
}

/* ========================================
   PRODUCTO API → PRODUCTO FRONT
======================================== */

function mapProduct(
  product: ApiProduct,
): Product {
  if (
    typeof product.legacyId !==
    "number"
  ) {
    throw new Error(
      `El producto "${product.name}" no tiene legacyId.`,
    );
  }

  return {
    id: product.legacyId,

    name: product.name,
    description:
      product.description,
    price: product.price,

    image: product.image,
    imageAlt:
      product.imageAlt,

    category:
      getProductCategory(
        product.category,
      ),

    available:
      product.active,

    featured:
      product.featured,

    ingredients:
      product.ingredients,

    sizeOptions:
      product.sizes.map(
        mapOption,
      ),

    extraOptions:
      product.extras.map(
        mapOption,
      ),
  };
}

/* ========================================
   OBTENER TODOS
======================================== */

export async function getProducts(): Promise<
  Product[]
> {
  const response =
    await fetch(
      `${API_URL}/api/products`,
    );

  if (!response.ok) {
    throw new Error(
      `No se pudo obtener el menú. Código ${response.status}.`,
    );
  }

  const result =
    (await response.json()) as ApiProductsResponse;

  if (
    !result.success ||
    !Array.isArray(result.data)
  ) {
    throw new Error(
      "La respuesta del servidor no tiene un formato válido.",
    );
  }

  return result.data.map(
    mapProduct,
  );
}

/* ========================================
   OBTENER UNO
======================================== */

export async function getProductById(
  productId: number,
): Promise<Product> {
  const response =
    await fetch(
      `${API_URL}/api/products/${productId}`,
    );

  if (response.status === 404) {
    throw new Error(
      "PRODUCT_NOT_FOUND",
    );
  }

  if (!response.ok) {
    throw new Error(
      `No se pudo obtener el producto. Código ${response.status}.`,
    );
  }

  const result =
    (await response.json()) as ApiProductResponse;

  if (
    !result.success ||
    !result.data
  ) {
    throw new Error(
      "La respuesta del servidor no tiene un formato válido.",
    );
  }

  return mapProduct(
    result.data,
  );
}