import { createContext } from "react";

import type {
  Product,
  ProductCustomization,
} from "../types/Product";

export type CartItem = Product & {
  cartItemId: string;
  quantity: number;
  unitPrice: number;
  customization: ProductCustomization;
};

export type CartContextType = {
  cart: CartItem[];
  totalUnits: number;
  totalPrice: number;

  addProduct: (
    product: Product,
    customization?: ProductCustomization,
  ) => void;

  increaseQuantity: (cartItemId: string) => void;
  decreaseQuantity: (cartItemId: string) => void;
  removeProduct: (cartItemId: string) => void;
  clearCart: () => void;
};

export const CartContext = createContext<
  CartContextType | undefined
>(undefined);