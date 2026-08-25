import {
  useEffect,
  useState,
} from "react";

import { getProductById } from "../services/productsApi";

import type { Product } from "../types/Product";

export function useProduct(
  productId: number | null,
) {
  const [
    product,
    setProduct,
  ] = useState<Product | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    notFound,
    setNotFound,
  ] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      setProduct(null);
      setError(null);
      setNotFound(false);

      if (productId === null) {
        setLoading(false);
        setNotFound(true);
        return;
      }

      try {
        setLoading(true);

        const productResponse =
          await getProductById(
            productId,
          );

        if (!isMounted) {
          return;
        }

        setProduct(
          productResponse,
        );
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        if (
          requestError instanceof Error &&
          requestError.message ===
            "PRODUCT_NOT_FOUND"
        ) {
          setNotFound(true);
          return;
        }

        console.error(
          "Error cargando producto:",
          requestError,
        );

        setError(
          "No pudimos cargar este producto. Intentá nuevamente en unos segundos.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  return {
    product,
    loading,
    error,
    notFound,
  };
}