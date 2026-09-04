const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000";

export type ProductAvailability = {
  productId: string;
  legacyId?: number;
  available: boolean;
  reason?:
    | "stock"
    | "configuration";
};

export async function getProductAvailability():
  Promise<ProductAvailability[]> {
  const response =
    await fetch(
      `${API_URL}/api/inventory/availability`,
    );

  if (!response.ok) {
    return [];
  }

  const data =
    (await response.json()) as {
      data: ProductAvailability[];
    };

  return data.data;
}
