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

export type ProductChoiceOption = {
  id: string;
  label: string;
  kind: "burger" | "beverage";
  productLegacyId?: number;
  sizeId?: "simple" | "doble";
  ingredients: string[];
};

export type ProductChoiceGroup = {
  id: string;
  label: string;
  options: ProductChoiceOption[];
};

export type ProductChoiceSelection = {
  groupId: string;
  groupLabel: string;
  option: ProductChoiceOption;
  removedIngredients: string[];
};

export type ProductCustomization = {
  size?: ProductOption;
  extras?: ProductOption[];
  removedIngredients?: string[];
  notes?: string;
  choices?: ProductChoiceSelection[];
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
  choiceGroups?: ProductChoiceGroup[];
  dailyComboBurgerId?:
    | "solo-queso"
    | "clasic"
    | "bacon"
    | "crispy";
};
