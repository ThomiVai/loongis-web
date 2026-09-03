const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000";

/* ========================================
   TIPOS
======================================== */

export type AdminOrderStatus =
  | "pending"
  | "confirmed"
  | "cancelled";

export type AdminOrderOption = {
  id: string;
  name: string;
  label: string;
  priceModifier: number;
};

export type AdminOrderItem = {
  product: string;
  legacyId: number;
  name: string;
  basePrice: number;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  customization: {
    size?: AdminOrderOption;
    extras: AdminOrderOption[];
    removedIngredients: string[];
    choices: Array<{
      groupId: string;
      groupLabel: string;
      optionId: string;
      optionLabel: string;
      kind: "burger" | "beverage";
      productLegacyId?: number;
      sizeId?: "simple" | "doble";
      removedIngredients: string[];
    }>;
    notes: string;
  };
};

export type AdminOrder = {
  _id: string;
  orderNumber: number;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  deliveryMethod:
    | "delivery"
    | "pickup";
  paymentMethod:
    | "cash"
    | "transfer";
  items: AdminOrderItem[];
  productsTotal: number;
  deliveryCost:
    number | null;
  total: number;
  status: AdminOrderStatus;
  inventoryTrackingStatus?:
    | "not_enabled"
    | "deducted";
  inventoryDeductedAt?: string;
  generalNotes: string;
  createdAt?: string;
  updatedAt?: string;
};

type OrdersResponse = {
  success: boolean;
  data?: AdminOrder[];
  message?: string;
};

type OrderResponse = {
  success: boolean;
  data?: AdminOrder;
  message?: string;
};

/* ========================================
   HELPERS
======================================== */

async function readJson<T>(
  response: Response,
): Promise<T> {
  try {
    return (
      await response.json()
    ) as T;
  } catch {
    throw new Error(
      "La API no devolvió una respuesta válida.",
    );
  }
}

function authHeaders(
  token: string,
): HeadersInit {
  return {
    Authorization:
      `Bearer ${token}`,
  };
}

/* ========================================
   LISTAR PEDIDOS
======================================== */

export async function getAdminOrders(
  token: string,
  status?: AdminOrderStatus,
): Promise<AdminOrder[]> {
  const searchParams =
    new URLSearchParams();

  if (status) {
    searchParams.set(
      "status",
      status,
    );
  }

  const query =
    searchParams.toString();

  const response =
    await fetch(
      `${API_URL}/api/orders${
        query
          ? `?${query}`
          : ""
      }`,
      {
        headers:
          authHeaders(token),
      },
    );

  const data =
    await readJson<OrdersResponse>(
      response,
    );

  if (
    !response.ok ||
    !data.success ||
    !data.data
  ) {
    throw new Error(
      data.message ??
        "No se pudieron cargar los pedidos.",
    );
  }

  return data.data;
}

/* ========================================
   OBTENER PEDIDO
======================================== */

export async function getAdminOrderById(
  orderId: string,
  token: string,
): Promise<AdminOrder> {
  const response =
    await fetch(
      `${API_URL}/api/orders/${orderId}`,
      {
        headers:
          authHeaders(token),
      },
    );

  const data =
    await readJson<OrderResponse>(
      response,
    );

  if (
    !response.ok ||
    !data.success ||
    !data.data
  ) {
    throw new Error(
      data.message ??
        "No se pudo cargar el pedido.",
    );
  }

  return data.data;
}

/* ========================================
   CAMBIAR ESTADO
======================================== */

export async function updateAdminOrderStatus(
  orderId: string,
  token: string,
  status:
    | "confirmed"
    | "cancelled",
): Promise<AdminOrder> {
  const response =
    await fetch(
      `${API_URL}/api/orders/${orderId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
          ...authHeaders(token),
        },
        body:
          JSON.stringify({
            status,
          }),
      },
    );

  const data =
    await readJson<OrderResponse>(
      response,
    );

  if (
    !response.ok ||
    !data.success ||
    !data.data
  ) {
    throw new Error(
      data.message ??
        "No se pudo actualizar el pedido.",
    );
  }

  return data.data;
}
