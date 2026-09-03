import type {
  AdminIngredient,
} from "./adminInventoryApi";

import type {
  AdminProduct,
  AdminProductOption,
} from "./adminProductsApi";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000";

/* ========================================
   TIPOS
======================================== */

export type AdminRecipeIngredientRef =
  | AdminIngredient
  | string;

export type AdminRecipeProductRef =
  | Pick<
      AdminProduct,
      | "_id"
      | "legacyId"
      | "name"
      | "slug"
      | "ingredients"
      | "sizes"
      | "extras"
      | "active"
    >
  | string;

export type AdminRecipeBaseItem = {
  ingredient:
    AdminRecipeIngredientRef;

  quantity:
    number;

  removableIngredient?:
    string;
};

export type AdminRecipeModifierItem = {
  ingredient:
    AdminRecipeIngredientRef;

  quantity:
    number;
};

export type AdminRecipeOptionModifier = {
  optionId:
    string;

  items:
    AdminRecipeModifierItem[];
};

export type AdminProductRecipe = {
  _id:
    string;

  product:
    AdminRecipeProductRef;

  baseItems:
    AdminRecipeBaseItem[];

  sizeModifiers:
    AdminRecipeOptionModifier[];

  extraModifiers:
    AdminRecipeOptionModifier[];

  active:
    boolean;

  createdAt?:
    string;

  updatedAt?:
    string;
};

export type SaveRecipeBaseItem = {
  ingredient:
    string;

  quantity:
    number;

  removableIngredient?:
    string;
};

export type SaveRecipeModifierItem = {
  ingredient:
    string;

  quantity:
    number;
};

export type SaveRecipeOptionModifier = {
  optionId:
    string;

  items:
    SaveRecipeModifierItem[];
};

export type SaveAdminProductRecipeData = {
  baseItems:
    SaveRecipeBaseItem[];

  sizeModifiers:
    SaveRecipeOptionModifier[];

  extraModifiers:
    SaveRecipeOptionModifier[];

  active:
    boolean;
};

/* ========================================
   RESPUESTAS
======================================== */

type RecipesResponse = {
  success:
    boolean;

  data:
    AdminProductRecipe[];

  message?:
    string;
};

type RecipeResponse = {
  success:
    boolean;

  data:
    AdminProductRecipe;

  message?:
    string;
};

/* ========================================
   HELPERS
======================================== */

function getHeaders(
  token: string,
): HeadersInit {
  return {
    "Content-Type":
      "application/json",

    Authorization:
      `Bearer ${token}`,
  };
}

async function getErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const data =
      (await response.json()) as {
        message?: string;
      };

    return (
      data.message ??
      fallback
    );
  } catch {
    return fallback;
  }
}

/* ========================================
   LISTAR
======================================== */

export async function getAdminRecipes(
  token: string,
): Promise<
  AdminProductRecipe[]
> {
  const response =
    await fetch(
      `${API_URL}/api/recipes`,
      {
        headers:
          getHeaders(
            token,
          ),
      },
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudieron cargar las recetas.",
      ),
    );
  }

  const data =
    (await response.json()) as
      RecipesResponse;

  return data.data;
}

/* ========================================
   GUARDAR
======================================== */

export async function saveAdminRecipe(
  productId: string,
  token: string,
  recipeData:
    SaveAdminProductRecipeData,
): Promise<
  AdminProductRecipe
> {
  const response =
    await fetch(
      `${API_URL}/api/recipes/product/${productId}`,
      {
        method:
          "PUT",

        headers:
          getHeaders(
            token,
          ),

        body:
          JSON.stringify(
            recipeData,
          ),
      },
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo guardar la receta.",
      ),
    );
  }

  const data =
    (await response.json()) as
      RecipeResponse;

  return data.data;
}

/* ========================================
   HELPERS DE UI
======================================== */

export function getRecipeIngredientId(
  ingredient:
    AdminRecipeIngredientRef,
): string {
  return typeof ingredient ===
    "string"
    ? ingredient
    : ingredient._id;
}

export function getRecipeProductId(
  product:
    AdminRecipeProductRef,
): string {
  return typeof product ===
    "string"
    ? product
    : product._id;
}

export function findOptionById(
  options:
    AdminProductOption[],
  optionId:
    string,
): AdminProductOption | undefined {
  return options.find(
    (option) =>
      option.id ===
      optionId,
  );
}
