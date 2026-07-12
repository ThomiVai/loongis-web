import type { Product } from "../types/Product";

export const products: Product[] = [
  {
    id: 1,
    name: "Loongis Clásica",
    description:
      "Doble carne smash, cheddar, cebolla crispy y salsa Loongis.",
    price: 9800,
    image: "/images/burgers/loongis-clasica.png",
    imageAlt: "Hamburguesa Loongis Clásica",
  },
  {
    id: 2,
    name: "Loongis Bacon",
    description:
      "Doble carne smash, cheddar, bacon crocante y salsa especial.",
    price: 10900,
    image: "/images/burgers/loongis-bacon.png",
    imageAlt: "Hamburguesa Loongis Bacon",
  },
  {
    id: 3,
    name: "Loongis Doble Cheddar",
    description:
      "Doble carne smash, doble cheddar, cebolla crispy y pepinillos.",
    price: 11200,
    image: "/images/burgers/loongis-doble-cheddar.png",
    imageAlt: "Hamburguesa Loongis Doble Cheddar",
  },
];