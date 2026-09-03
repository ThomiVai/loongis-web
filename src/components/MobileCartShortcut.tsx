import {
  FaArrowRight,
  FaBagShopping,
} from "react-icons/fa6";

import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  useCart,
} from "../hooks/useCart";

import "../styles/MobileCartShortcut.css";

export function MobileCartShortcut() {
  const {
    totalPrice,
    totalUnits,
  } = useCart();

  const location =
    useLocation();

  const isCheckoutRoute =
    location.pathname === "/carrito" ||
    location.pathname === "/finalizar-pedido";

  if (
    totalUnits === 0 ||
    isCheckoutRoute
  ) {
    return null;
  }

  const productLabel =
    totalUnits === 1
      ? "1 producto"
      : `${totalUnits} productos`;

  return (
    <Link
      className="mobile-cart-shortcut"
      to="/carrito"
      aria-label={`Ver mi pedido: ${productLabel}, total $${totalPrice.toLocaleString("es-AR")}`}
    >
      <span
        className="mobile-cart-shortcut__icon"
        aria-hidden="true"
      >
        <FaBagShopping />
      </span>

      <span className="mobile-cart-shortcut__copy">
        <strong>Mi pedido</strong>

        <small>{productLabel}</small>
      </span>

      <strong className="mobile-cart-shortcut__price">
        ${totalPrice.toLocaleString("es-AR")}
      </strong>

      <FaArrowRight
        className="mobile-cart-shortcut__arrow"
        aria-hidden="true"
      />
    </Link>
  );
}
