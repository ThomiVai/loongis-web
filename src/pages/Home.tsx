import { BurgerCombos } from "../components/BurgerCombos";
import { BusinessBenefits } from "../components/BusinessBenefits";
import { Categories } from "../components/Categories";
import { DailyPromo } from "../components/DailyPromo";
import { FeaturedProducts } from "../components/FeaturedProducts";
import { Hero } from "../components/Hero";
import { StoreInfo } from "../components/StoreInfo";

export function Home() {
  return (
    <main id="inicio">
      <Hero />

      <Categories />

      <DailyPromo />

      <BurgerCombos />

      <FeaturedProducts />

      <BusinessBenefits />

      <StoreInfo />
    </main>
  );
}