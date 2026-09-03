const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000";

/* ========================================
   TIPOS
======================================== */

export type AdminIngredientUnit =
  | "unit"
  | "portion"
  | "gram"
  | "kilogram"
  | "milliliter"
  | "liter";

export type AdminInventoryMovementType =
  | "initial"
  | "restock"
  | "waste"
  | "adjustment"
  | "sale";

export type AdminIngredient = {
  _id: string;

  name: string;
  slug: string;

  unit: AdminIngredientUnit;

  stock: number;
  minimumStock: number;

  unitCost: number;

  active: boolean;
  order: number;

  createdAt?: string;
  updatedAt?: string;
};

export type AdminInventorySettings = {
  enabled: boolean;
  readyToEnable: boolean;
  activeIngredients: number;
  configuredRecipes: number;
};

export type AdminInventoryMovement = {
  _id: string;

  ingredient:
    | {
        _id: string;
        name: string;
        unit: AdminIngredientUnit;
      }
    | string;

  type: AdminInventoryMovementType;

  change: number;

  previousStock: number;
  newStock: number;

  unitCost: number;
  estimatedCost: number;

  note?: string;

  createdAt?: string;
};

export type CreateAdminIngredientData = {
  name: string;

  unit: AdminIngredientUnit;

  stock: number;
  minimumStock: number;

  unitCost: number;

  active: boolean;
  order: number;
};

export type UpdateAdminIngredientData = {
  name?: string;

  unit?: AdminIngredientUnit;

  minimumStock?: number;

  unitCost?: number;

  active?: boolean;
  order?: number;
};

export type CreateInventoryMovementData =
  | {
      type:
        | "restock"
        | "waste";

      quantity: number;

      note?: string;
    }
  | {
      type:
        "adjustment";

      newStock: number;

      note?: string;
    };

/* ========================================
   RESPUESTAS
======================================== */

type IngredientsResponse = {
  success: boolean;
  data: AdminIngredient[];
  message?: string;
};

type IngredientResponse = {
  success: boolean;
  data: AdminIngredient;
  message?: string;
};

type InventoryMovementResponse = {
  success: boolean;

  data: {
    ingredient:
      AdminIngredient;

    movement:
      AdminInventoryMovement;
  };

  message?: string;
};

type InventoryMovementsResponse = {
  success: boolean;

  data:
    AdminInventoryMovement[];

  message?: string;
};

type InventorySettingsResponse = {
  success: boolean;
  data: AdminInventorySettings;
  message?: string;
};

/* ========================================
   HELPERS
======================================== */

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

function getAdminHeaders(
  token: string,
): HeadersInit {
  return {
    "Content-Type":
      "application/json",

    Authorization:
      `Bearer ${token}`,
  };
}

/* ========================================
   CONFIGURACIÓN
======================================== */

export async function getAdminInventorySettings(
  token: string,
): Promise<AdminInventorySettings> {
  const response =
    await fetch(
      `${API_URL}/api/inventory/settings`,
      {
        headers:
          getAdminHeaders(
            token,
          ),
      },
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo cargar la configuración de inventario.",
      ),
    );
  }

  const data =
    (await response.json()) as
      InventorySettingsResponse;

  return data.data;
}

export async function updateAdminInventorySettings(
  token: string,
  enabled: boolean,
): Promise<AdminInventorySettings> {
  const response =
    await fetch(
      `${API_URL}/api/inventory/settings`,
      {
        method:
          "PATCH",

        headers:
          getAdminHeaders(
            token,
          ),

        body:
          JSON.stringify({
            enabled,
          }),
      },
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo actualizar la configuración de inventario.",
      ),
    );
  }

  const data =
    (await response.json()) as
      InventorySettingsResponse;

  return data.data;
}

/* ========================================
   INSUMOS
======================================== */

export async function getAdminIngredients(
  token: string,
): Promise<AdminIngredient[]> {
  const response =
    await fetch(
      `${API_URL}/api/inventory/ingredients`,
      {
        headers:
          getAdminHeaders(
            token,
          ),
      },
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo cargar el inventario.",
      ),
    );
  }

  const data =
    (await response.json()) as
      IngredientsResponse;

  return data.data;
}

export async function createAdminIngredient(
  token: string,
  ingredientData:
    CreateAdminIngredientData,
): Promise<AdminIngredient> {
  const response =
    await fetch(
      `${API_URL}/api/inventory/ingredients`,
      {
        method:
          "POST",

        headers:
          getAdminHeaders(
            token,
          ),

        body:
          JSON.stringify(
            ingredientData,
          ),
      },
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo crear el insumo.",
      ),
    );
  }

  const data =
    (await response.json()) as
      IngredientResponse;

  return data.data;
}

export async function updateAdminIngredient(
  ingredientId: string,
  token: string,
  ingredientData:
    UpdateAdminIngredientData,
): Promise<AdminIngredient> {
  const response =
    await fetch(
      `${API_URL}/api/inventory/ingredients/${ingredientId}`,
      {
        method:
          "PUT",

        headers:
          getAdminHeaders(
            token,
          ),

        body:
          JSON.stringify(
            ingredientData,
          ),
      },
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo actualizar el insumo.",
      ),
    );
  }

  const data =
    (await response.json()) as
      IngredientResponse;

  return data.data;
}

/* ========================================
   MOVIMIENTOS
======================================== */

export async function createAdminInventoryMovement(
  ingredientId: string,
  token: string,
  movementData:
    CreateInventoryMovementData,
): Promise<{
  ingredient: AdminIngredient;
  movement: AdminInventoryMovement;
}> {
  const response =
    await fetch(
      `${API_URL}/api/inventory/ingredients/${ingredientId}/movements`,
      {
        method:
          "POST",

        headers:
          getAdminHeaders(
            token,
          ),

        body:
          JSON.stringify(
            movementData,
          ),
      },
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo registrar el movimiento.",
      ),
    );
  }

  const data =
    (await response.json()) as
      InventoryMovementResponse;

  return data.data;
}

export async function getAdminInventoryMovements(
  token: string,
  limit = 30,
): Promise<
  AdminInventoryMovement[]
> {
  const params =
    new URLSearchParams({
      limit:
        String(limit),
    });

  const response =
    await fetch(
      `${API_URL}/api/inventory/movements?${params.toString()}`,
      {
        headers:
          getAdminHeaders(
            token,
          ),
      },
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo cargar el historial de inventario.",
      ),
    );
  }

  const data =
    (await response.json()) as
      InventoryMovementsResponse;

  return data.data;
}
