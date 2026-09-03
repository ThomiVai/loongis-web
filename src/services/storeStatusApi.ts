const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000";

export type StoreOrderMode =
  | "automatic"
  | "open"
  | "paused";

export type StoreOperationalState =
  | "open"
  | "paused"
  | "closed";

export type StoreStatusData = {
  orderMode: StoreOrderMode;
  scheduleOpen: boolean;
  canOrder: boolean;
  state: StoreOperationalState;
  statusLabel: string;
  detailLabel: string;
  updatedAt: string | null;
};

type StoreStatusResponse = {
  success: boolean;
  data?: StoreStatusData;
  message?: string;
};

async function readStoreStatusResponse(
  response: Response,
): Promise<StoreStatusData> {
  let data:
    StoreStatusResponse;

  try {
    data =
      (await response.json()) as
        StoreStatusResponse;
  } catch {
    throw new Error(
      "El servidor devolvió una respuesta inválida.",
    );
  }

  if (
    !response.ok ||
    !data.data
  ) {
    throw new Error(
      data.message ??
        "No se pudo obtener el estado del local.",
    );
  }

  return data.data;
}

export async function getStoreStatus():
  Promise<StoreStatusData> {
  const response =
    await fetch(
      `${API_URL}/api/store/status`,
      {
        cache: "no-store",
      },
    );

  return readStoreStatusResponse(
    response,
  );
}

export async function updateStoreOrderMode(
  orderMode: StoreOrderMode,
  token: string,
): Promise<StoreStatusData> {
  const response =
    await fetch(
      `${API_URL}/api/store/status`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify({
          orderMode,
        }),
      },
    );

  return readStoreStatusResponse(
    response,
  );
}
