import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  CartContext,
  type CartItem,
} from "./CartContext";

import type {
  Product,
  ProductCustomization,
} from "../types/Product";

type CartProviderProps = {
  children: ReactNode;
};

const CART_STORAGE_KEY = "loongis-cart";

function normalizeCustomization(
  customization?: ProductCustomization,
): ProductCustomization {
  return {
    size: customization?.size,
    extras: [...(customization?.extras ?? [])].sort((first, second) =>
      first.id.localeCompare(second.id),
    ),
    removedIngredients: [
      ...(customization?.removedIngredients ?? []),
    ].sort(),
    notes: customization?.notes?.trim() ?? "",
  };
}

function createCartItemId(
  productId: number,
  customization?: ProductCustomization,
): string {
  const normalizedCustomization =
    normalizeCustomization(customization);

  const customizationIdentifier = {
    size: normalizedCustomization.size?.id ?? "",
    extras:
      normalizedCustomization.extras?.map(
        (extra) => extra.id,
      ) ?? [],
    removedIngredients:
      normalizedCustomization.removedIngredients ?? [],
    notes: normalizedCustomization.notes ?? "",
  };

  return `${productId}-${JSON.stringify(
    customizationIdentifier,
  )}`;
}

function calculateUnitPrice(
  product: Product,
  customization?: ProductCustomization,
): number {
  const sizePrice =
    customization?.size?.priceModifier ?? 0;

  const extrasPrice =
    customization?.extras?.reduce(
      (total, extra) => total + extra.priceModifier,
      0,
    ) ?? 0;

  return Math.max(
    0,
    product.price + sizePrice + extrasPrice,
  );
}

function getStoredCart(): CartItem[] {
  try {
    const storedCart = localStorage.getItem(
      CART_STORAGE_KEY,
    );

    if (!storedCart) {
      return [];
    }

    const parsedCart: unknown = JSON.parse(storedCart);

    if (!Array.isArray(parsedCart)) {
      return [];
    }

    /*
      Este map también adapta el carrito antiguo,
      que todavía no tenía cartItemId ni unitPrice.
    */
    return parsedCart.map((storedItem) => {
      const item = storedItem as Partial<CartItem> &
        Product;

      const customization = normalizeCustomization(
        item.customization,
      );

      return {
        ...item,
        quantity:
          typeof item.quantity === "number" &&
          item.quantity > 0
            ? item.quantity
            : 1,
        unitPrice:
          typeof item.unitPrice === "number"
            ? item.unitPrice
            : item.price,
        customization,
        cartItemId:
          item.cartItemId ??
          createCartItemId(item.id, customization),
      } as CartItem;
    });
  } catch (error) {
    console.error(
      "No se pudo recuperar el carrito:",
      error,
    );

    return [];
  }
}

export function CartProvider({
  children,
}: CartProviderProps) {
  const [cart, setCart] =
    useState<CartItem[]>(getStoredCart);

  useEffect(() => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(cart),
    );
  }, [cart]);

  const addProduct = (
    product: Product,
    customization?: ProductCustomization,
  ) => {
    const normalizedCustomization =
      normalizeCustomization(customization);

    const cartItemId = createCartItemId(
      product.id,
      normalizedCustomization,
    );

    const unitPrice = calculateUnitPrice(
      product,
      normalizedCustomization,
    );

    setCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) => item.cartItemId === cartItemId,
      );

      if (existingProduct) {
        return currentCart.map((item) =>
          item.cartItemId === cartItemId
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          cartItemId,
          quantity: 1,
          unitPrice,
          customization: normalizedCustomization,
        },
      ];
    });
  };

  const increaseQuantity = (
    cartItemId: string,
  ) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  };

  const decreaseQuantity = (
    cartItemId: string,
  ) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.cartItemId === cartItemId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeProduct = (
    cartItemId: string,
  ) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.cartItemId !== cartItemId,
      ),
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalUnits = useMemo(() => {
    return cart.reduce(
      (total, item) => total + item.quantity,
      0,
    );
  }, [cart]);

  const totalPrice = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total + item.unitPrice * item.quantity,
      0,
    );
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        totalUnits,
        totalPrice,
        addProduct,
        increaseQuantity,
        decreaseQuantity,
        removeProduct,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}