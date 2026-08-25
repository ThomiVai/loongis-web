import {
  useEffect,
  useState,
} from "react";

import { getProducts } from "../services/productsApi";

import type { Product } from "../types/Product";

export function useProducts() {
  const [
    products,
    setProducts,
  ] = useState<Product[]>([]);

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

  useEffect(() => {
    let isMounted =
      true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);

        const productsResponse =
          await getProducts();

        if (!isMounted) {
          return;
        }

        setProducts(
          productsResponse,
        );
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        console.error(
          "Error cargando productos:",
          requestError,
        );

        setError(
          "No pudimos cargar el menú. Intentá nuevamente en unos segundos.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    products,
    loading,
    error,
  };
}