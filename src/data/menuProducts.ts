import { products as originalProducts } from "./products";

/* ========================================
   OPCIONES DE HAMBURGUESAS
======================================== */

export const hamburgerSizes = [
  {
    id: "simple",
    name: "Simple",
    label: "Simple",
    price: -1800,
    priceModifier: -1800,
  },
  {
    id: "doble",
    name: "Doble",
    label: "Doble",
    price: 0,
    priceModifier: 0,
  },
  {
    id: "triple",
    name: "Triple",
    label: "Triple",
    price: 2200,
    priceModifier: 2200,
  },
];

/* ========================================
   EXTRAS
======================================== */

export const hamburgerExtras = [
  {
    id: "cheddar",
    name: "Cheddar extra",
    label: "Cheddar extra",
    price: 700,
    priceModifier: 700,
  },
  {
    id: "bacon",
    name: "Bacon extra",
    label: "Bacon extra",
    price: 1200,
    priceModifier: 1200,
  },
  {
    id: "huevo",
    name: "Huevo",
    label: "Huevo",
    price: 900,
    priceModifier: 900,
  },
  {
    id: "medallon",
    name: "Medallón extra",
    label: "Medallón extra",
    price: 1800,
    priceModifier: 1800,
  },
];

/* ========================================
   INGREDIENTES
======================================== */

const ingredientsByProductId: Record<
  number,
  string[]
> = {
  1: ["Queso"],

  2: [
    "Queso",
    "Lechuga",
    "Tomate",
    "Cebolla morada",
    "Salsa Loongis",
    "Pickles",
  ],

  3: [
    "Queso",
    "Bacon",
    "Salsa especial",
  ],

  4: [
    "Queso",
    "Cebolla crispy",
    "Bacon",
    "Salsa de mostaza dulce",
  ],
};

/* ========================================
   HAMBURGUESAS
======================================== */

const hamburgerProducts = originalProducts.map(
  (product) => ({
    ...product,

    productCategory:
      "hamburguesas" as const,

    category:
      "hamburguesas" as const,

    featured:
      [2, 3, 4].includes(product.id),

    /*
      Las dejamos con ambos nombres
      por compatibilidad.

      ProductDetail usa:
      sizeOptions / extraOptions

      Si algún componente anterior usa:
      sizes / extras

      también seguirá funcionando.
    */

    sizes: hamburgerSizes,

    sizeOptions:
      hamburgerSizes,

    extras:
      hamburgerExtras,

    extraOptions:
      hamburgerExtras,

    ingredients:
      ingredientsByProductId[
        product.id
      ] ?? [],
  }),
);

/* ========================================
   COMBOS
======================================== */

const comboProducts = [
  {
    id: 101,

    name: "Combo Clásico",

    description:
      "Loongis Clasic acompañada con papas crocantes y bebida individual.",

    price: 14500,

    image:
      "/images/burgers/combo-promo.png",

    imageAlt:
      "Combo Clásico con hamburguesa Loongis Clasic, papas y bebida",

    productCategory:
      "combos" as const,

    category:
      "combos" as const,

    featured: false,

    sizes:
      hamburgerSizes,

    sizeOptions:
      hamburgerSizes,

    extras:
      hamburgerExtras,

    extraOptions:
      hamburgerExtras,

    ingredients:
      ingredientsByProductId[2],
  },

  {
    id: 102,

    name: "Combo Bacon",

    description:
      "Loongis Bacon acompañada con papas crocantes y bebida individual.",

    price: 15800,

    image:
      "/images/burgers/combo-bacon.png",

    imageAlt:
      "Combo Bacon con hamburguesa Loongis Bacon, papas y bebida",

    productCategory:
      "combos" as const,

    category:
      "combos" as const,

    featured: false,

    sizes:
      hamburgerSizes,

    sizeOptions:
      hamburgerSizes,

    extras:
      hamburgerExtras,

    extraOptions:
      hamburgerExtras,

    ingredients:
      ingredientsByProductId[3],
  },

  {
    id: 109,

    name: "Combo Crispy",

    description:
      "Loongis Crispy acompañada con papas crocantes y bebida individual.",

    price: 16100,

    image:
      "/images/burgers/combo-crispy.png",

    imageAlt:
      "Combo Crispy con hamburguesa Loongis Crispy, papas y bebida",

    productCategory:
      "combos" as const,

    category:
      "combos" as const,

    featured: false,

    sizes:
      hamburgerSizes,

    sizeOptions:
      hamburgerSizes,

    extras:
      hamburgerExtras,

    extraOptions:
      hamburgerExtras,

    ingredients:
      ingredientsByProductId[4],
  },

  {
    id: 110,

    name: "Combo Simple Queso",

    description:
      "Simple Queso acompañada con papas crocantes y bebida individual.",

    price: 14200,

    image:
      "/images/burgers/combo-simplequeso.png",

    imageAlt:
      "Combo Simple Queso con hamburguesa, papas y bebida",

    productCategory:
      "combos" as const,

    category:
      "combos" as const,

    featured: false,

    sizes:
      hamburgerSizes,

    sizeOptions:
      hamburgerSizes,

    extras:
      hamburgerExtras,

    extraOptions:
      hamburgerExtras,

    ingredients:
      ingredientsByProductId[1],
  },
];

/* ========================================
   PRODUCTOS DEL MENÚ
======================================== */

export const menuProducts = [
  ...hamburgerProducts,
  ...comboProducts,
];

/* ========================================
   PRODUCTOS DESTACADOS
======================================== */

export const featuredProducts =
  menuProducts.filter(
    (product) =>
      product.featured,
  );