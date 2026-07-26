import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  FaCheck,
  FaPlus,
} from "react-icons/fa6";

import { useCart } from "../hooks/useCart";
import { useNotification } from "../hooks/useNotification";

import type {
  Product,
  ProductCustomization,
} from "../types/Product";

import "../styles/AddToCartButton.css";

type AddToCartButtonProps = {
  product: Product;
  className: string;
  label?: string;
  customization?: ProductCustomization;
};

export function AddToCartButton({
  product,
  className,
  label = "Agregar",
  customization,
}: AddToCartButtonProps) {
  const { addProduct } = useCart();

  const { showNotification } =
    useNotification();

  const [productAdded, setProductAdded] =
    useState(false);

  const timeoutReference =
    useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutReference.current !== null) {
        window.clearTimeout(
          timeoutReference.current,
        );
      }
    };
  }, []);

  const handleAddProduct = () => {
    addProduct(product, customization);

    setProductAdded(true);

    showNotification(
      `${product.name} se agregó a tu pedido.`,
      "success",
    );

    if (timeoutReference.current !== null) {
      window.clearTimeout(
        timeoutReference.current,
      );
    }

    timeoutReference.current =
      window.setTimeout(() => {
        setProductAdded(false);
      }, 1300);
  };

  return (
    <button
      className={`${className} add-to-cart-button ${
        productAdded
          ? "add-to-cart-button--added"
          : ""
      }`}
      type="button"
      aria-label={
        productAdded
          ? `${product.name} agregado al pedido`
          : `Agregar ${product.name} al pedido`
      }
      onClick={handleAddProduct}
    >
      {productAdded ? (
        <FaCheck
          className="add-to-cart-button__icon"
          aria-hidden="true"
        />
      ) : (
        <FaPlus
          className="add-to-cart-button__icon"
          aria-hidden="true"
        />
      )}

      <span>
        {productAdded ? "Agregado" : label}
      </span>
    </button>
  );
}