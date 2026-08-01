import type { Product } from "../types/Product";

export const products: Product[] = [
  {
    id: 1,
    name: "Simple Queso",
    description:
      "Medallón smash y doble queso.",
    price: 9500,
    image:
      "/images/burgers/simple-queso.png",
    imageAlt:
      "Hamburguesa Simple Queso con medallón smash y doble queso",
  },
  {
    id: 2,
    name: "Loongis Clasic",
    description:
      "Medallón smash, doble queso, lechuga, tomate, cebolla morada, salsa Loongis y pickles.",
    price: 9800,
    image:
      "/images/burgers/loongis-clasic.png",
    imageAlt:
      "Hamburguesa Loongis Clasic con doble queso, lechuga, tomate, cebolla morada, salsa Loongis y pickles",
  },
  {
    id: 3,
    name: "Loongis Bacon",
    description:
      "Medallón smash, doble queso, doble bacon y salsa especial.",
    price: 10900,
    image:
      "/images/burgers/loongis-bacon.png",
    imageAlt:
      "Hamburguesa Loongis Bacon con doble queso, doble bacon y salsa especial",
  },
  {
    id: 4,
    name: "Loongis Crispy",
    description:
      "Medallón smash, doble queso, cebolla crispy, bacon y salsa de mostaza dulce.",
    price: 11200,
    image:
      "/images/burgers/loongis-crispy.png",
    imageAlt:
      "Hamburguesa Loongis Crispy con doble queso, cebolla crispy, bacon y salsa de mostaza dulce",
  },
];