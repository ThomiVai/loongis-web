import {
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { AdminNoIndex } from "./components/AdminNoIndex";
import { Footer } from "./components/Footer";
import { MobileCartShortcut } from "./components/MobileCartShortcut";
import { Navbar } from "./components/Navbar";
import { NotificationContainer } from "./components/NotificationContainer";
import { PageTitle } from "./components/PageTitle";
import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute";
import { ScrollToTop } from "./components/ScrollToTop";
import { StoreStatus } from "./components/StoreStatus";

import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminOrderDetail } from "./pages/AdminOrderDetail";
import { AdminOrders } from "./pages/AdminOrders";
import { AdminInventory } from "./pages/AdminInventory";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminProductEdit } from "./pages/AdminProductEdit";
import { AdminRecipes } from "./pages/AdminRecipes";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { Home } from "./pages/Home";
import { Menu } from "./pages/Menu";
import { NotFound } from "./pages/NotFound";
import { ProductDetail } from "./pages/ProductDetail";

function App() {
  const location =
    useLocation();

  const isAdminRoute =
    location.pathname.startsWith(
      "/admin",
    );

  return (
    <>
      <PageTitle />

      <ScrollToTop />

      <NotificationContainer />

      {/* =================================
          SEO ADMIN
      ================================= */}

      {isAdminRoute && (
        <AdminNoIndex />
      )}

      {/* =================================
          LAYOUT TIENDA
      ================================= */}

      {!isAdminRoute && (
        <>
          <Navbar />

          <StoreStatus />
        </>
      )}

      {/* =================================
          RUTAS
      ================================= */}

      <Routes>

        {/* ===============================
            TIENDA
        =============================== */}

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
          element={
            <ProductDetail />
          }
        />

        <Route
          path="/carrito"
          element={<Cart />}
        />

        <Route
          path="/finalizar-pedido"
          element={
            <Checkout />
          }
        />

        {/* ===============================
            LOGIN ADMIN
        =============================== */}

        <Route
          path="/admin/login"
          element={
            <AdminLogin />
          }
        />

        {/* ===============================
            ADMIN PROTEGIDO
        =============================== */}

        <Route
          element={
            <ProtectedAdminRoute />
          }
        >
          <Route
            path="/admin"
            element={
              <AdminDashboard />
            }
          />

          <Route
            path="/admin/pedidos"
            element={
              <AdminOrders />
            }
          />

          <Route
            path="/admin/pedidos/:orderId"
            element={
              <AdminOrderDetail />
            }
          />

          <Route
            path="/admin/inventario"
            element={
              <AdminInventory />
            }
          />

          <Route
            path="/admin/recetas"
            element={
              <AdminRecipes />
            }
          />

          <Route
            path="/admin/productos/:productId/editar"
            element={
              <AdminProductEdit />
            }
          />
        </Route>

        {/* ===============================
            404
        =============================== */}

        <Route
          path="*"
          element={
            <NotFound />
          }
        />

      </Routes>

      {!isAdminRoute && (
        <MobileCartShortcut />
      )}

      {/* =================================
          FOOTER TIENDA
      ================================= */}

      {!isAdminRoute && (
        <Footer />
      )}
    </>
  );
}

export default App;
