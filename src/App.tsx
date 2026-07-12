import { BusinessBenefits } from "./components/BusinessBenefits";
import { Categories } from "./components/Categories";
import { DailyPromo } from "./components/DailyPromo";
import { FeaturedProducts } from "./components/FeaturedProducts";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Navbar } from "./components/Navbar";
import { StoreInfo } from "./components/StoreInfo";

import "./styles/global.css";

function App() {
  return (
    <>
      <Navbar />

      <main id="inicio">
        <Hero />
        <Categories />
        <FeaturedProducts />
        <DailyPromo />
        <BusinessBenefits />
        <StoreInfo />
      </main>

      <Footer />
    </>
  );
}

export default App;