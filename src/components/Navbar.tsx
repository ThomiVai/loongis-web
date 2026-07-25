import { useState } from "react";
import {
  FaBars,
  FaShoppingBag,
  FaTimes,
} from "react-icons/fa";
import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useCart } from "../hooks/useCart";

import "../styles/Navbar.css";

export function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const navigate = useNavigate();

  const { totalUnits } = useCart();

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  const abrirCarrito = () => {
    cerrarMenu();
    navigate("/carrito");
  };

  const obtenerClaseLink = ({
    isActive,
  }: {
    isActive: boolean;
  }) => {
    return isActive
      ? "navbar__link navbar__link--active"
      : "navbar__link";
  };

  return (
    <header className="navbar">
      <div className="container navbar__container">
        <NavLink
          to="/"
          className="navbar__logo"
          onClick={cerrarMenu}
          aria-label="Ir al inicio de Loongis"
        >
          <img
            src="/images/logos/loongis-logo.jpeg"
            alt="Logo de Loongis"
          />
        </NavLink>

        <button
          className="navbar__mobile-button"
          type="button"
          aria-label={
            menuAbierto
              ? "Cerrar menú"
              : "Abrir menú"
          }
          aria-expanded={menuAbierto}
          onClick={() =>
            setMenuAbierto(
              (estadoActual) => !estadoActual,
            )
          }
        >
          {menuAbierto ? (
            <FaTimes aria-hidden="true" />
          ) : (
            <FaBars aria-hidden="true" />
          )}
        </button>

        <nav
          className={`navbar__navigation ${
            menuAbierto
              ? "navbar__navigation--open"
              : ""
          }`}
          aria-label="Navegación principal"
        >
          <NavLink
            to="/"
            end
            className={obtenerClaseLink}
            onClick={cerrarMenu}
          >
            Inicio
          </NavLink>

          <NavLink
            to="/menu"
            className={obtenerClaseLink}
            onClick={cerrarMenu}
          >
            Menú
          </NavLink>

          <Link
            to="/#combos"
            className="navbar__link"
            onClick={cerrarMenu}
          >
            Combos
          </Link>

          <Link
            to="/#nosotros"
            className="navbar__link"
            onClick={cerrarMenu}
          >
            Nosotros
          </Link>

          <Link
            to="/#contacto"
            className="navbar__link"
            onClick={cerrarMenu}
          >
            Contacto
          </Link>
        </nav>

        <button
          className="navbar__order-button"
          type="button"
          aria-label={`Ver mi pedido. ${totalUnits} unidades`}
          onClick={abrirCarrito}
        >
          <FaShoppingBag aria-hidden="true" />

          <span>Mi pedido</span>

          <span className="navbar__cart-count">
            {totalUnits}
          </span>
        </button>
      </div>
    </header>
  );
}