import {
  useEffect,
  useState,
} from "react";

import {
  getCachedProducts,
  getProducts,
} from "../services/productsApi";

import type {
  Product,
} from "../types/Product";

export function useProducts() {
  /* ========================================
     PRODUCTOS
  ======================================== */

  const [
    products,
    setProducts,
  ] =
    useState<Product[]>(
      () =>
        getCachedProducts(),
    );

  /* ========================================
     REQUEST FINALIZADO
  ======================================== */

  const [
    requestFinished,
    setRequestFinished,
  ] =
    useState(false);

  /* ========================================
     ERROR
  ======================================== */

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  /* ========================================
     ESTADOS DERIVADOS
  ======================================== */

  /*
    Si tenemos productos guardados,
    NO bloqueamos la interfaz con loading.

    Render se actualiza en segundo plano.
  */

  const loading =
    products.length === 0 &&
    !requestFinished;

  /*
    Este estado nos va a servir más adelante
    si queremos mostrar una indicación muy
    sutil de actualización.
  */

  const refreshing =
    products.length > 0 &&
    !requestFinished;

  /* ========================================
     CARGAR / REVALIDAR CATÁLOGO
  ======================================== */

  useEffect(() => {
    let isMounted =
      true;

    /*
      Nos interesa saber si arrancamos
      con una copia válida del catálogo.

      Si Render falla pero había caché,
      seguimos mostrando esa copia en vez
      de reemplazar toda la página por error.
    */

    const hadCachedProducts =
      getCachedProducts()
        .length > 0;

    async function loadProducts() {
      try {
        const productsResponse =
          await getProducts();

        if (!isMounted) {
          return;
        }

        setProducts(
          productsResponse,
        );

        setError(null);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        console.error(
          "Error cargando productos:",
          requestError,
        );

        /*
          Si ya teníamos una copia del catálogo,
          preferimos conservar la tienda visible.

          Si no teníamos absolutamente nada,
          mostramos el error normal.
        */

        if (
          !hadCachedProducts
        ) {
          setError(
            "No pudimos cargar el menú. Intentá nuevamente en unos segundos.",
          );
        }
      } finally {
        if (isMounted) {
          setRequestFinished(
            true,
          );
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
    refreshing,
    error,
  };
}