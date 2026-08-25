import {
  useEffect,
} from "react";

import {
  useLocation,
} from "react-router-dom";

import { BurgerCombos } from "../components/BurgerCombos";
import { BusinessBenefits } from "../components/BusinessBenefits";
import { Categories } from "../components/Categories";
import { DailyPromo } from "../components/DailyPromo";
import { FeaturedProducts } from "../components/FeaturedProducts";
import { FloatingLoongis } from "../components/FloatingLoongis";
import { Hero } from "../components/Hero";
import { StoreInfo } from "../components/StoreInfo";

import { useProducts } from "../hooks/useProducts";

import {
  scrollToHash,
} from "../utils/scrollToHash";

export function Home() {
  const {
    products,
    loading,
    error,
  } = useProducts();

  const {
    hash,
  } = useLocation();

  /* ========================================
     AJUSTAR SCROLL DESPUÉS DE CARGAR
  ======================================== */

  useEffect(() => {
    if (
      loading ||
      !hash
    ) {
      return;
    }

    /*
      Cuando terminan de cargar los productos,
      aparecen secciones que antes no estaban
      renderizadas.

      Volvemos a calcular la posición del hash
      para compensar ese cambio de altura.
    */

    const animationFrame =
      window.requestAnimationFrame(
        () => {
          scrollToHash(
            hash,
            "smooth",
          );
        },
      );

    return () => {
      window.cancelAnimationFrame(
        animationFrame,
      );
    };
  }, [
    loading,
    hash,
  ]);

  return (
    <main id="inicio">
      <Hero />

      <Categories />

      <DailyPromo
        products={products}
        loading={loading}
        error={error}
      />

      <BurgerCombos
        products={products}
        loading={loading}
        error={error}
      />

      <FeaturedProducts
        products={products}
        loading={loading}
        error={error}
      />

      <BusinessBenefits />

      <StoreInfo />

      <FloatingLoongis />
    </main>
  );
}