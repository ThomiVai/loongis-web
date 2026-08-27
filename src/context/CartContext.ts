import {
  createContext,
} from "react";

import type {
  Product,
  ProductCustomization,
} from "../types/Product";

/* ========================================
   ITEM DEL CARRITO
======================================== */

export type CartItem =
  Product & {
    cartItemId: string;
    quantity: number;
    unitPrice: number;
    customization:
      ProductCustomization;
  };

/* ========================================
   CONTEXTO
======================================== */

export type CartContextType = {
  cart: CartItem[];

  totalUnits: number;
  totalPrice: number;

  addProduct: (
    product: Product,
    customization?:
      ProductCustomization,
  ) => void;

  updateCartItem: (
    cartItemId: string,
    customization:
      ProductCustomization,
  ) => void;

  increaseQuantity: (
    cartItemId: string,
  ) => void;

  decreaseQuantity: (
    cartItemId: string,
  ) => void;

  removeProduct: (
    cartItemId: string,
  ) => void;

  clearCart: () => void;
};

/* ========================================
   CONTEXT
======================================== */

export const CartContext =
  createContext<
    CartContextType | undefined
  >(undefined);