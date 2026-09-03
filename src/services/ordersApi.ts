const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000";

/* ========================================
   TIPOS DE ENTRADA
======================================== */

export type CreateOrderCustomization = {
  sizeId?: string;

  extraIds: string[];

  removedIngredients: string[];

  choices: Array<{
    groupId: string;
    optionId: string;
    removedIngredients: string[];
  }>;

  notes: string;
};

export type CreateOrderItem = {
  legacyId: number;

  quantity: number;

  customization:
    CreateOrderCustomization;
};

export type CreateOrderData = {
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

  items: CreateOrderItem[];

  generalNotes: string;
};

/* ========================================
   TIPOS DE RESPUESTA
======================================== */

export type CreatedOrderStatus =
  | "pending"
  | "confirmed"
  | "cancelled";

export type CreatedOrderOption = {
  id: string;

  name: string;

  label: string;

  priceModifier: number;
};

export type CreatedOrderItem = {
  product: string;

  legacyId: number;

  name: string;

  basePrice: number;

  unitPrice: number;

  quantity: number;

  lineTotal: number;

  customization: {
    size?: CreatedOrderOption;

    extras:
      CreatedOrderOption[];

    removedIngredients:
      string[];

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

export type CreatedOrder = {
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

  items: CreatedOrderItem[];

  productsTotal: number;

  deliveryCost:
    number | null;

  total: number;

  status:
    CreatedOrderStatus;

  generalNotes: string;

  createdAt?: string;
  updatedAt?: string;
};

type CreateOrderResponse = {
  success: boolean;

  data?: CreatedOrder;

  message?: string;
};

/* ========================================
   CREAR PEDIDO
======================================== */

export async function createOrder(
  orderData: CreateOrderData,
): Promise<CreatedOrder> {
  const response =
    await fetch(
      `${API_URL}/api/orders`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            orderData,
          ),
      },
    );

  let data:
    CreateOrderResponse;

  try {
    data =
      (await response.json()) as
        CreateOrderResponse;
  } catch {
    throw new Error(
      "La API no devolvió una respuesta válida al registrar el pedido.",
    );
  }

  if (
    !response.ok ||
    !data.success ||
    !data.data
  ) {
    throw new Error(
      data.message ??
        "No se pudo registrar el pedido.",
    );
  }

  return data.data;
}
