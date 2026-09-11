const API_URL =
  import.meta.env?.VITE_API_URL ??
  "http://localhost:3000";

export function productImageUrl(
  image: string,
): string {
  return image.startsWith("/api/")
    ? `${API_URL}${image}`
    : image;
}

export function uploadedProductImageId(
  image: string,
): string | null {
  return image.match(
    /^\/api\/products\/images\/([a-f0-9]{24})$/i,
  )?.[1] ?? null;
}
