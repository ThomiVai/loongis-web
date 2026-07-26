import { Route, Routes } from "react-router-dom";

import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { PageTitle } from "./components/PageTitle";
import { ScrollToTop } from "./components/ScrollToTop";

import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { Home } from "./pages/Home";
import { Menu } from "./pages/Menu";
import { NotFound } from "./pages/NotFound";
import { ProductDetail } from "./pages/ProductDetail";
import { NotificationContainer } from "./components/NotificationContainer";
import { StoreStatus } from "./components/StoreStatus";

function App() {
  return (
    <>
      <PageTitle />
      <ScrollToTop />
      <NotificationContainer />

      <Navbar />
      <StoreStatus />

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/menu"
          element={<Menu />}
        />

        <Route
          path="/producto/:productId"
          element={<ProductDetail />}
        />

        <Route
          path="/carrito"
          element={<Cart />}
        />

        <Route
          path="/finalizar-pedido"
          element={<Checkout />}
        />

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>

      <Footer />
    </>
  );
}

export default App;