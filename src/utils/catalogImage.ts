// Defaults replace only the original catalog photos; owner uploads take priority.
const defaults: Record<number, { previous: string; image: string; alt: string }> = {
  101: { previous: "/images/burgers/combo-promo.png", image: "/images/burgers/combo-gula-original.png", alt: "Combo Gula: dos hamburguesas dobles a elección con papas" },
  110: { previous: "/images/burgers/combo-simplequeso.png", image: "/images/burgers/combo-tranka-original.png", alt: "Combo Tranka: dos hamburguesas dobles con queso y papas" },
  302: { previous: "/images/fries/papas-cheddar-bacon.png", image: "/images/fries/papas-cheddar-bacon-original.png", alt: "Papas con cheddar y bacon de Loongis" },
  303: { previous: "/images/fries/papas-luck.png", image: "/images/fries/papas-luck-original.png", alt: "Papas Luck con salsa especial Loongis" },
};

export function withCatalogImage<T extends { legacyId?: number; image: string; imageAlt: string }>(product: T): T {
  const replacement = product.legacyId === undefined ? undefined : defaults[product.legacyId];
  return replacement && product.image === replacement.previous
    ? { ...product, image: replacement.image, imageAlt: replacement.alt }
    : product;
}
