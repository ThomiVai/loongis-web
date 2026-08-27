export type ProductCategory =
  | "hamburguesas"
  | "combos"
  | "papas"
  | "bebidas"
  | "postres";

export type ProductOption = {
  id: string;
  name: string;
  label?: string;
  priceModifier: number;
};

export type ProductCustomization = {
  size?: ProductOption;
  extras?: ProductOption[];
  removedIngredients?: string[];
  notes?: string;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  imageAlt: string;
  category?: ProductCategory;
  available?: boolean;
  featured?: boolean;
  dailyPromo?: boolean;
  ingredients?: string[];
  sizeOptions?: ProductOption[];
  extraOptions?: ProductOption[];
};
