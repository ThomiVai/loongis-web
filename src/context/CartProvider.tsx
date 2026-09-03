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

/* ========================================
   PROPS
======================================== */

type CartProviderProps = {
  children: ReactNode;
};

/* ========================================
   STORAGE
======================================== */

const CART_STORAGE_KEY =
  "loongis-cart-v3";

/* ========================================
   NORMALIZAR PERSONALIZACIÓN
======================================== */

function normalizeCustomization(
  customization?:
    ProductCustomization,
): ProductCustomization {
  return {
    size:
      customization?.size,

    extras: [
      ...(
        customization?.extras ??
        []
      ),
    ].sort(
      (
        first,
        second,
      ) =>
        first.id.localeCompare(
          second.id,
        ),
    ),

    removedIngredients: [
      ...(
        customization
          ?.removedIngredients ??
        []
      ),
    ].sort(),

    notes:
      customization?.notes?.trim() ??
      "",

    choices: [
      ...(customization?.choices ?? []),
    ].map((choice) => ({
      ...choice,
      removedIngredients: [
        ...choice.removedIngredients,
      ].sort(),
    })),
  };
}

/* ========================================
   ID ÚNICO DE CONFIGURACIÓN
======================================== */

function createCartItemId(
  productId: number,
  customization?:
    ProductCustomization,
): string {
  const normalizedCustomization =
    normalizeCustomization(
      customization,
    );

  const customizationIdentifier =
    {
      size:
        normalizedCustomization
          .size?.id ?? "",

      extras:
        normalizedCustomization
          .extras?.map(
            (extra) =>
              extra.id,
          ) ?? [],

      removedIngredients:
        normalizedCustomization
          .removedIngredients ??
        [],

      notes:
        normalizedCustomization
          .notes ?? "",

      choices:
        normalizedCustomization
          .choices?.map((choice) => ({
            groupId: choice.groupId,
            optionId: choice.option.id,
            removedIngredients:
              choice.removedIngredients,
          })) ?? [],
    };

  return `${productId}-${JSON.stringify(
    customizationIdentifier,
  )}`;
}

/* ========================================
   PRECIO UNITARIO
======================================== */

function calculateUnitPrice(
  product: Product,
  customization?:
    ProductCustomization,
): number {
  const sizePrice =
    customization?.size
      ?.priceModifier ?? 0;

  const extrasPrice =
    customization?.extras?.reduce(
      (
        total,
        extra,
      ) =>
        total +
        extra.priceModifier,

      0,
    ) ?? 0;

  return Math.max(
    0,

    product.price +
      sizePrice +
      extrasPrice,
  );
}

/* ========================================
   RECUPERAR CARRITO
======================================== */

function getStoredCart():
  CartItem[] {
  try {
    const storedCart =
      localStorage.getItem(
        CART_STORAGE_KEY,
      );

    if (!storedCart) {
      return [];
    }

    const parsedCart:
      unknown =
      JSON.parse(
        storedCart,
      );

    if (
      !Array.isArray(
        parsedCart,
      )
    ) {
      return [];
    }

    /*
      También adaptamos carritos
      guardados por versiones anteriores
      de la web.
    */

    return parsedCart.map(
      (storedItem) => {
        const item =
          storedItem as
            Partial<CartItem> &
            Product;

        const customization =
          normalizeCustomization(
            item.customization,
          );

        return {
          ...item,

          quantity:
            typeof item.quantity ===
              "number" &&
            item.quantity > 0
              ? item.quantity
              : 1,

          unitPrice:
            typeof item.unitPrice ===
            "number"
              ? item.unitPrice
              : item.price,

          customization,

          cartItemId:
            item.cartItemId ??
            createCartItemId(
              item.id,
              customization,
            ),
        } as CartItem;
      },
    );
  } catch (error) {
    console.error(
      "No se pudo recuperar el carrito:",
      error,
    );

    return [];
  }
}

/* ========================================
   PROVIDER
======================================== */

export function CartProvider({
  children,
}: CartProviderProps) {
  const [
    cart,
    setCart,
  ] =
    useState<CartItem[]>(
      getStoredCart,
    );

  /* ========================================
     GUARDAR CARRITO
  ======================================== */

  useEffect(() => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(
        cart,
      ),
    );
  }, [cart]);

  /* ========================================
     AGREGAR PRODUCTO
  ======================================== */

  const addProduct = (
    product: Product,
    customization?:
      ProductCustomization,
  ) => {
    const normalizedCustomization =
      normalizeCustomization(
        customization,
      );

    const cartItemId =
      createCartItemId(
        product.id,
        normalizedCustomization,
      );

    const unitPrice =
      calculateUnitPrice(
        product,
        normalizedCustomization,
      );

    setCart(
      (
        currentCart,
      ) => {
        const existingProduct =
          currentCart.find(
            (item) =>
              item.cartItemId ===
              cartItemId,
          );

        /*
          Si exactamente la misma
          personalización ya existe,
          aumentamos cantidad.
        */

        if (
          existingProduct
        ) {
          return currentCart.map(
            (item) =>
              item.cartItemId ===
              cartItemId
                ? {
                    ...item,

                    quantity:
                      item.quantity +
                      1,
                  }
                : item,
          );
        }

        /*
          Si es una personalización
          distinta, creamos otra línea.
        */

        return [
          ...currentCart,

          {
            ...product,

            cartItemId,

            quantity: 1,

            unitPrice,

            customization:
              normalizedCustomization,
          },
        ];
      },
    );
  };

  /* ========================================
     EDITAR PERSONALIZACIÓN
  ======================================== */

  const updateCartItem = (
    cartItemId: string,
    customization:
      ProductCustomization,
  ) => {
    const normalizedCustomization =
      normalizeCustomization(
        customization,
      );

    setCart(
      (
        currentCart,
      ) => {
        /* ==================================
           ENCONTRAR ITEM ORIGINAL
        ================================== */

        const itemToUpdate =
          currentCart.find(
            (item) =>
              item.cartItemId ===
              cartItemId,
          );

        if (
          !itemToUpdate
        ) {
          return currentCart;
        }

        /* ==================================
           RECALCULAR
        ================================== */

        const newCartItemId =
          createCartItemId(
            itemToUpdate.id,
            normalizedCustomization,
          );

        const newUnitPrice =
          calculateUnitPrice(
            itemToUpdate,
            normalizedCustomization,
          );

        /* ==================================
           MISMA CONFIGURACIÓN
        ================================== */

        if (
          newCartItemId ===
          cartItemId
        ) {
          return currentCart.map(
            (item) =>
              item.cartItemId ===
              cartItemId
                ? {
                    ...item,

                    unitPrice:
                      newUnitPrice,

                    customization:
                      normalizedCustomization,
                  }
                : item,
          );
        }

        /* ==================================
           ¿YA EXISTE LA NUEVA CONFIGURACIÓN?
        ================================== */

        const existingTarget =
          currentCart.find(
            (item) =>
              item.cartItemId ===
              newCartItemId,
          );

        /*
          Ejemplo:

          Antes:
          1x Bacon doble
          1x Bacon triple

          Editamos la triple para
          convertirla en doble.

          Resultado:
          2x Bacon doble

          No dejamos dos líneas iguales.
        */

        if (
          existingTarget
        ) {
          return currentCart
            .filter(
              (item) =>
                item.cartItemId !==
                cartItemId,
            )
            .map(
              (item) =>
                item.cartItemId ===
                newCartItemId
                  ? {
                      ...item,

                      quantity:
                        item.quantity +
                        itemToUpdate
                          .quantity,

                      unitPrice:
                        newUnitPrice,

                      customization:
                        normalizedCustomization,
                    }
                  : item,
            );
        }

        /* ==================================
           CONFIGURACIÓN NUEVA
        ================================== */

        return currentCart.map(
          (item) =>
            item.cartItemId ===
            cartItemId
              ? {
                  ...item,

                  cartItemId:
                    newCartItemId,

                  unitPrice:
                    newUnitPrice,

                  customization:
                    normalizedCustomization,
                }
              : item,
        );
      },
    );
  };

  /* ========================================
     AUMENTAR CANTIDAD
  ======================================== */

  const increaseQuantity = (
    cartItemId: string,
  ) => {
    setCart(
      (
        currentCart,
      ) =>
        currentCart.map(
          (item) =>
            item.cartItemId ===
            cartItemId
              ? {
                  ...item,

                  quantity:
                    item.quantity +
                    1,
                }
              : item,
        ),
    );
  };

  /* ========================================
     DISMINUIR CANTIDAD
  ======================================== */

  const decreaseQuantity = (
    cartItemId: string,
  ) => {
    setCart(
      (
        currentCart,
      ) =>
        currentCart
          .map(
            (item) =>
              item.cartItemId ===
              cartItemId
                ? {
                    ...item,

                    quantity:
                      item.quantity -
                      1,
                  }
                : item,
          )
          .filter(
            (item) =>
              item.quantity >
              0,
          ),
    );
  };

  /* ========================================
     ELIMINAR PRODUCTO
  ======================================== */

  const removeProduct = (
    cartItemId: string,
  ) => {
    setCart(
      (
        currentCart,
      ) =>
        currentCart.filter(
          (item) =>
            item.cartItemId !==
            cartItemId,
        ),
    );
  };

  /* ========================================
     VACIAR CARRITO
  ======================================== */

  const clearCart =
    () => {
      setCart([]);
    };

  /* ========================================
     UNIDADES TOTALES
  ======================================== */

  const totalUnits =
    useMemo(
      () =>
        cart.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.quantity,

          0,
        ),

      [cart],
    );

  /* ========================================
     PRECIO TOTAL
  ======================================== */

  const totalPrice =
    useMemo(
      () =>
        cart.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.unitPrice *
              item.quantity,

          0,
        ),

      [cart],
    );

  /* ========================================
     CONTEXTO
  ======================================== */

  return (
    <CartContext.Provider
      value={{
        cart,

        totalUnits,

        totalPrice,

        addProduct,

        updateCartItem,

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
