import type {
  AdminIngredient,
  AdminIngredientUnit,
} from "./adminInventoryApi";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000";

export type AdminSupplier = {
  _id: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  notes?: string;
  active: boolean;
};

export type AdminPurchaseLine = {
  ingredient: string;
  ingredientName: string;
  presentationQuantity: number;
  presentationLabel: string;
  conversionFactor: number;
  baseQuantity: number;
  totalCost: number;
  unitCost: number;
  batchNumber?: string;
  expirationDate?: string;
};

export type AdminPurchase = {
  _id: string;
  supplierName?: string;
  invoiceNumber?: string;
  purchasedAt: string;
  lines: AdminPurchaseLine[];
  totalCost: number;
  notes?: string;
  createdByEmail: string;
};

export type AdminInventoryCount = {
  _id: string;
  countedAt: string;
  label?: string;
  notes?: string;
  totalDifferenceCost: number;
  createdByEmail: string;
  items: Array<{
    ingredient: string;
    ingredientName: string;
    expectedStock: number;
    countedStock: number;
    difference: number;
    unitCost: number;
    estimatedDifferenceCost: number;
  }>;
};

export type AdminInventoryAlerts = {
  lowStock: AdminIngredient[];
  shoppingList: Array<{
    ingredientId: string;
    name: string;
    unit: AdminIngredientUnit;
    currentStock: number;
    minimumStock: number;
    targetStock: number;
    suggestedQuantity: number;
  }>;
  expiringLots: Array<{
    _id: string;
    ingredient:
      | string
      | {
          _id: string;
          name: string;
          unit: AdminIngredientUnit;
        };
    supplierName?: string;
    batchNumber?: string;
    expirationDate: string;
    remainingQuantity: number;
  }>;
  expirationWindowDays: number;
};

export type AdminInventoryReport = {
  from: string;
  to: string;
  revenue: number;
  confirmedOrders: number;
  estimatedSalesCost: number;
  estimatedGrossMargin: number;
  wasteCost: number;
  adjustmentCost: number;
  purchasesCost: number;
  purchaseCount: number;
  inventoryValue: number;
  movementsByType:
    Record<
      string,
      {
        estimatedCost: number;
        movements: number;
      }
    >;
  consumptionByIngredient:
    Array<{
      ingredientId: string;
      name: string;
      unit?: AdminIngredientUnit;
      quantity: number;
      estimatedCost: number;
    }>;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

function headers(
  token: string,
): HeadersInit {
  return {
    "Content-Type":
      "application/json",
    Authorization:
      `Bearer ${token}`,
  };
}

async function request<T>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<T> {
  const response =
    await fetch(
      `${API_URL}${path}`,
      {
        ...init,
        headers: {
          ...headers(token),
          ...init?.headers,
        },
      },
    );

  const data =
    (await response.json()) as
      ApiResponse<T>;

  if (!response.ok) {
    throw new Error(
      data.message ??
        "No se pudo completar la operación.",
    );
  }

  return data.data;
}

export function getAdminSuppliers(
  token: string,
): Promise<AdminSupplier[]> {
  return request(
    "/api/inventory/suppliers",
    token,
  );
}

export function createAdminSupplier(
  token: string,
  supplier: {
    name: string;
    contactName?: string;
    phone?: string;
    email?: string;
    notes?: string;
  },
): Promise<AdminSupplier> {
  return request(
    "/api/inventory/suppliers",
    token,
    {
      method: "POST",
      body:
        JSON.stringify(
          supplier,
        ),
    },
  );
}

export function createAdminPurchase(
  token: string,
  purchase: {
    supplierId?: string;
    invoiceNumber?: string;
    purchasedAt: string;
    notes?: string;
    lines: Array<{
      ingredientId: string;
      presentationQuantity: number;
      presentationLabel: string;
      conversionFactor: number;
      totalCost: number;
      batchNumber?: string;
      expirationDate?: string;
    }>;
  },
): Promise<AdminPurchase> {
  return request(
    "/api/inventory/purchases",
    token,
    {
      method: "POST",
      body:
        JSON.stringify(
          purchase,
        ),
    },
  );
}

export function getAdminPurchases(
  token: string,
): Promise<AdminPurchase[]> {
  return request(
    "/api/inventory/purchases?limit=50",
    token,
  );
}

export function createAdminInventoryCount(
  token: string,
  count: {
    label?: string;
    countedAt: string;
    notes?: string;
    items: Array<{
      ingredientId: string;
      countedStock: number;
    }>;
  },
): Promise<AdminInventoryCount> {
  return request(
    "/api/inventory/counts",
    token,
    {
      method: "POST",
      body:
        JSON.stringify(
          count,
        ),
    },
  );
}

export function getAdminInventoryCounts(
  token: string,
): Promise<AdminInventoryCount[]> {
  return request(
    "/api/inventory/counts",
    token,
  );
}

export function getAdminInventoryAlerts(
  token: string,
  days = 7,
): Promise<AdminInventoryAlerts> {
  return request(
    `/api/inventory/alerts?days=${days}`,
    token,
  );
}

export function getAdminInventoryReport(
  token: string,
  from: string,
  to: string,
): Promise<AdminInventoryReport> {
  const params =
    new URLSearchParams({
      from,
      to,
    });

  return request(
    `/api/inventory/report?${params.toString()}`,
    token,
  );
}
