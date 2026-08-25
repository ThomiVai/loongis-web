import { BurgerCombos } from "../components/BurgerCombos";
import { BusinessBenefits } from "../components/BusinessBenefits";
import { Categories } from "../components/Categories";
import { DailyPromo } from "../components/DailyPromo";
import { FeaturedProducts } from "../components/FeaturedProducts";
import { FloatingLoongis } from "../components/FloatingLoongis";
import { Hero } from "../components/Hero";
import { StoreInfo } from "../components/StoreInfo";

import { useProducts } from "../hooks/useProducts";

export function Home() {
  const {
    products,
    loading,
    error,
  } = useProducts();

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