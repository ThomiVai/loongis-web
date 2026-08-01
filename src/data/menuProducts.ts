import { products as originalProducts } from "./products";

import type {
  Product,
  ProductOption,
} from "../types/Product";

/*
  Crea imágenes temporales para los productos
  que todavía no tienen fotografía oficial.
*/
function createProductIllustration(
  emoji: string,
  label: string,
): string {
  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="700"
      height="520"
      viewBox="0 0 700 520"
    >
      <defs>
        <radialGradient
          id="background"
          cx="50%"
          cy="45%"
          r="65%"
        >
          <stop
            offset="0%"
            stop-color="#fff8dc"
          />

          <stop
            offset="65%"
            stop-color="#fffdf4"
          />

          <stop
            offset="100%"
            stop-color="#ffffff"
          />
        </radialGradient>
      </defs>

      <rect
        width="700"
        height="520"
        rx="50"
        fill="url(#background)"
      />

      <circle
        cx="350"
        cy="230"
        r="145"
        fill="#f4c928"
        fill-opacity="0.22"
      />

      <circle
        cx="350"
        cy="230"
        r="115"
        fill="#075fea"
        fill-opacity="0.08"
      />

      <text
        x="350"
        y="285"
        text-anchor="middle"
        font-size="170"
        font-family="Arial, sans-serif"
      >
        ${emoji}
      </text>

      <text
        x="350"
        y="450"
        text-anchor="middle"
        font-size="34"
        font-weight="700"
        font-family="Arial, sans-serif"
        fill="#075fea"
      >
        ${label}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    svg,
  )}`;
}

/*
  Tamaños disponibles para las hamburguesas.

  El precio registrado en products.ts representa
  actualmente la opción doble.
*/
const hamburgerSizeOptions: ProductOption[] = [
  {
    id: "simple",
    name: "Simple",
    priceModifier: -1800,
  },
  {
    id: "doble",
    name: "Doble",
    priceModifier: 0,
  },
  {
    id: "triple",
    name: "Triple",
    priceModifier: 2200,
  },
];

/*
  Extras disponibles para las hamburguesas.
*/
const hamburgerExtraOptions: ProductOption[] = [
  {
    id: "extra-cheddar",
    name: "Cheddar extra",
    priceModifier: 700,
  },
  {
    id: "extra-bacon",
    name: "Bacon",
    priceModifier: 1200,
  },
  {
    id: "extra-huevo",
    name: "Huevo",
    priceModifier: 900,
  },
  {
    id: "extra-medallon",
    name: "Medallón extra",
    priceModifier: 1800,
  },
];

/*
  Devuelve los ingredientes oficiales de cada
  hamburguesa para poder quitarlos desde la
  página de personalización.
*/
function getHamburgerIngredients(
  productName: string,
): string[] {
  const normalizedName =
    productName.toLowerCase();

  if (
    normalizedName.includes("simple queso")
  ) {
    return ["Queso"];
  }

  if (normalizedName.includes("clasic")) {
    return [
      "Queso",
      "Lechuga",
      "Tomate",
      "Cebolla morada",
      "Salsa Loongis",
      "Pickles",
    ];
  }

  if (normalizedName.includes("bacon")) {
    return [
      "Queso",
      "Bacon",
      "Salsa especial",
    ];
  }

  if (normalizedName.includes("crispy")) {
    return [
      "Queso",
      "Cebolla crispy",
      "Bacon",
      "Salsa de mostaza dulce",
    ];
  }

  return [];
}

/*
  Solo estas hamburguesas aparecerán en la
  sección de productos destacados del Home.

  Simple Queso seguirá apareciendo en el menú,
  pero no en el Home.
*/
const featuredProductIds = new Set<number>([
  2,
  3,
  4,
]);

const hamburgers: Product[] =
  originalProducts.map((product) => ({
    ...product,
    category: "hamburguesas",
    available: true,
    featured: featuredProductIds.has(
      product.id,
    ),
    ingredients:
      getHamburgerIngredients(product.name),
    sizeOptions: hamburgerSizeOptions,
    extraOptions: hamburgerExtraOptions,
  }));

const additionalProducts: Product[] = [
  {
    id: 101,
    name: "Combo Clásico",
    description:
      "Loongis Clasic acompañada con papas crocantes y bebida individual.",
    price: 14500,
    image:
      "/images/burgers/combo-promo.png",
    imageAlt:
      "Combo Clásico de Loongis con hamburguesa, papas y bebida",
    category: "combos",
    available: true,
    featured: false,
  },
  {
    id: 102,
    name: "Combo Bacon",
    description:
      "Loongis Bacon acompañada con papas crocantes y bebida individual.",
    price: 15800,
    image: createProductIllustration(
      "🥤",
      "Combo Bacon",
    ),
    imageAlt:
      "Ilustración temporal del Combo Bacon de Loongis",
    category: "combos",
    available: true,
    featured: false,
  },
  {
    id: 103,
    name: "Papas Clásicas",
    description:
      "Papas fritas doradas, crocantes por fuera y tiernas por dentro.",
    price: 4500,
    image: createProductIllustration(
      "🍟",
      "Papas Clásicas",
    ),
    imageAlt:
      "Ilustración temporal de las Papas Clásicas de Loongis",
    category: "papas",
    available: true,
    featured: false,
  },
  {
    id: 104,
    name: "Papas Cheddar y Bacon",
    description:
      "Papas fritas cubiertas con cheddar cremoso y bacon crocante.",
    price: 6300,
    image: createProductIllustration(
      "🍟",
      "Cheddar y Bacon",
    ),
    imageAlt:
      "Ilustración temporal de las papas con cheddar y bacon",
    category: "papas",
    available: true,
    featured: false,
  },
  {
    id: 105,
    name: "Gaseosa",
    description:
      "Gaseosa individual fría. El sabor se coordina al confirmar el pedido.",
    price: 2500,
    image: createProductIllustration(
      "🥤",
      "Gaseosa",
    ),
    imageAlt:
      "Ilustración temporal de una gaseosa individual",
    category: "bebidas",
    available: true,
    featured: false,
  },
  {
    id: 106,
    name: "Agua mineral",
    description:
      "Botella individual de agua mineral sin gas.",
    price: 2000,
    image: createProductIllustration(
      "💧",
      "Agua Mineral",
    ),
    imageAlt:
      "Ilustración temporal de una botella de agua mineral",
    category: "bebidas",
    available: true,
    featured: false,
  },
  {
    id: 107,
    name: "Brownie Loongis",
    description:
      "Brownie húmedo de chocolate, ideal para cerrar el pedido.",
    price: 3800,
    image: createProductIllustration(
      "🍫",
      "Brownie Loongis",
    ),
    imageAlt:
      "Ilustración temporal del Brownie Loongis",
    category: "postres",
    available: true,
    featured: false,
  },
  {
    id: 108,
    name: "Cookie con chips",
    description:
      "Cookie artesanal con chips de chocolate.",
    price: 3200,
    image: createProductIllustration(
      "🍪",
      "Cookie Loongis",
    ),
    imageAlt:
      "Ilustración temporal de una cookie con chips de chocolate",
    category: "postres",
    available: true,
    featured: false,
  },
];

export const menuProducts: Product[] = [
  ...hamburgers,
  ...additionalProducts,
];

export const featuredProducts: Product[] =
  menuProducts.filter(
    (product) => product.featured === true,
  );