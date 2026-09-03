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

/*
  El catálogo se guarda en el navegador.

  Aunque exista caché, siempre volvemos
  a consultar la API en segundo plano.

  MAX_CACHE_AGE solamente determina
  cuánto tiempo estamos dispuestos a usar
  una copia vieja mientras Render despierta.
*/

const PRODUCTS_CACHE_KEY =
  "loongis_products_cache_v5";

const MAX_CACHE_AGE =
  1000 * 60 * 60 * 2;

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

type ApiProductChoiceGroup = {
  id: string;
  label: string;
  options: Array<{
    id: string;
    label: string;
    kind: "burger" | "beverage";
    productLegacyId?: number;
    sizeId?: "simple" | "doble";
    ingredients: string[];
  }>;
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
  dailyPromo?: boolean;
  active: boolean;
  order: number;

  sizes: ApiProductOption[];
  extras: ApiProductOption[];
  ingredients: string[];
  choiceGroups?: ApiProductChoiceGroup[];
  dailyComboBurgerId?:
    | "solo-queso"
    | "clasic"
    | "bacon"
    | "crispy";
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
   TIPO DE CACHÉ
======================================== */

type ProductsCache = {
  savedAt: number;
  products: Product[];
};

/* ========================================
   CACHÉ EN MEMORIA
======================================== */

/*
  Evita leer localStorage repetidamente
  durante la misma sesión.
*/

let memoryProductsCache:
  Product[] | null =
  null;

/* ========================================
   REQUEST EN CURSO
======================================== */

/*
  Si Home, Menu u otro componente solicitan
  el catálogo simultáneamente, todos reutilizan
  esta misma Promise.

  Así evitamos:
  GET /products
  GET /products
  GET /products
*/

let productsRequest:
  Promise<Product[]> | null =
  null;

/*
  También deduplicamos solicitudes individuales.

  Esto ayuda especialmente si ProductDetail
  y PageTitle solicitan el mismo producto.
*/

const productRequests =
  new Map<
    number,
    Promise<Product>
  >();

/* ========================================
   CATEGORÍAS
======================================== */

function getProductCategory(
  category:
    | ApiCategory
    | string,
):
  | ProductCategory
  | undefined {
  if (
    typeof category ===
    "string"
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

    name:
      option.name,

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
    id:
      product.legacyId,

    name:
      product.name,

    description:
      product.description,

    price:
      product.price,

    image:
      product.image,

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

    dailyPromo:
      product.dailyPromo ?? false,

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

    choiceGroups:
      product.choiceGroups ?? [],

    dailyComboBurgerId:
      product.dailyComboBurgerId,
  };
}

/* ========================================
   VALIDAR CACHÉ
======================================== */

function isProduct(
  value: unknown,
): value is Product {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const product =
    value as Partial<Product>;

  return (
    typeof product.id ===
      "number" &&
    typeof product.name ===
      "string" &&
    typeof product.description ===
      "string" &&
    typeof product.price ===
      "number" &&
    typeof product.image ===
      "string" &&
    typeof product.imageAlt ===
      "string"
  );
}

/* ========================================
   LEER CACHÉ
======================================== */

export function getCachedProducts():
  Product[] {
  /*
    Primero usamos memoria.
  */

  if (memoryProductsCache) {
    return [
      ...memoryProductsCache,
    ];
  }

  /*
    En entornos donde no existe window
    simplemente no usamos localStorage.
  */

  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  try {
    const rawCache =
      window.localStorage.getItem(
        PRODUCTS_CACHE_KEY,
      );

    if (!rawCache) {
      return [];
    }

    const parsedCache =
      JSON.parse(
        rawCache,
      ) as Partial<ProductsCache>;

    if (
      typeof parsedCache.savedAt !==
        "number" ||
      !Array.isArray(
        parsedCache.products,
      )
    ) {
      window.localStorage.removeItem(
        PRODUCTS_CACHE_KEY,
      );

      return [];
    }

    /* =====================================
       ANTIGÜEDAD
    ===================================== */

    const cacheAge =
      Date.now() -
      parsedCache.savedAt;

    if (
      cacheAge >
      MAX_CACHE_AGE
    ) {
      window.localStorage.removeItem(
        PRODUCTS_CACHE_KEY,
      );

      return [];
    }

    /* =====================================
       VALIDAR PRODUCTOS
    ===================================== */

    const validProducts =
      parsedCache.products.filter(
        isProduct,
      );

    if (
      validProducts.length !==
      parsedCache.products.length
    ) {
      window.localStorage.removeItem(
        PRODUCTS_CACHE_KEY,
      );

      return [];
    }

    memoryProductsCache =
      validProducts;

    return [
      ...validProducts,
    ];
  } catch {
    /*
      Si localStorage estuviera corrupto
      no queremos romper la tienda.
    */

    window.localStorage.removeItem(
      PRODUCTS_CACHE_KEY,
    );

    return [];
  }
}

/* ========================================
   GUARDAR CACHÉ
======================================== */

function saveProductsCache(
  products: Product[],
): void {
  memoryProductsCache = [
    ...products,
  ];

  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const cache:
    ProductsCache = {
    savedAt:
      Date.now(),

    products,
  };

  try {
    window.localStorage.setItem(
      PRODUCTS_CACHE_KEY,
      JSON.stringify(
        cache,
      ),
    );
  } catch {
    /*
      La tienda puede seguir funcionando
      aunque localStorage no esté disponible.
    */
  }
}

/* ========================================
   INVALIDAR CACHÉ
======================================== */

export function clearProductsCache():
  void {
  memoryProductsCache =
    null;

  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.removeItem(
    PRODUCTS_CACHE_KEY,
  );
}

/* ========================================
   FETCH TODOS
======================================== */

async function fetchProducts():
  Promise<Product[]> {
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
    (await response.json()) as
      ApiProductsResponse;

  if (
    !result.success ||
    !Array.isArray(
      result.data,
    )
  ) {
    throw new Error(
      "La respuesta del servidor no tiene un formato válido.",
    );
  }

  const products =
    result.data.map(
      mapProduct,
    );

  saveProductsCache(
    products,
  );

  return products;
}

/* ========================================
   OBTENER TODOS
======================================== */

export async function getProducts():
  Promise<Product[]> {
  /*
    Si ya existe una solicitud en curso,
    devolvemos la misma Promise.
  */

  if (productsRequest) {
    return productsRequest;
  }

  productsRequest =
    fetchProducts();

  try {
    return await productsRequest;
  } finally {
    /*
      Una vez terminada, permitimos una futura
      revalidación contra la API.
    */

    productsRequest =
      null;
  }
}

/* ========================================
   FETCH PRODUCTO INDIVIDUAL
======================================== */

async function fetchProductById(
  productId: number,
): Promise<Product> {
  const response =
    await fetch(
      `${API_URL}/api/products/${productId}`,
    );

  if (
    response.status === 404
  ) {
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
    (await response.json()) as
      ApiProductResponse;

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

/* ========================================
   OBTENER UNO
======================================== */

export async function getProductById(
  productId: number,
): Promise<Product> {
  /*
    Si dos componentes solicitan exactamente
    el mismo producto al mismo tiempo,
    reutilizamos la petición.
  */

  const currentRequest =
    productRequests.get(
      productId,
    );

  if (currentRequest) {
    return currentRequest;
  }

  const newRequest =
    fetchProductById(
      productId,
    );

  productRequests.set(
    productId,
    newRequest,
  );

  try {
    return await newRequest;
  } finally {
    productRequests.delete(
      productId,
    );
  }
}
