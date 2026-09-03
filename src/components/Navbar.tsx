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
  const [
    menuAbierto,
    setMenuAbierto,
  ] = useState(false);

  const navigate =
    useNavigate();

  const {
    totalUnits,
  } = useCart();

  /* ========================================
     CERRAR MENÚ MOBILE
  ======================================== */

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  /* ========================================
     ABRIR CARRITO
  ======================================== */

  const abrirCarrito = () => {
    cerrarMenu();

    navigate("/carrito");
  };

  /* ========================================
     CLASE DE NAVLINK
  ======================================== */

  const obtenerClaseLink = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    isActive
      ? "navbar__link navbar__link--active"
      : "navbar__link";

  return (
    <header className="navbar">
      <div className="container navbar__container">
        {/* ========================================
            LOGO
        ======================================== */}

        <NavLink
          to="/"
          className="navbar__logo"
          onClick={cerrarMenu}
          aria-label="Ir al inicio de Loongis"
        >
          <img
            className="navbar__logo-image"
            src="/images/logos/loongis-logo-navbar.png"
            alt="Logo de Loongis"
          />
        </NavLink>

        {/* ========================================
            BOTÓN MOBILE
        ======================================== */}

        <button
          className="navbar__mobile-button"
          type="button"
          aria-label={
            menuAbierto
              ? "Cerrar menú"
              : "Abrir menú"
          }
          aria-expanded={
            menuAbierto
          }
          onClick={() =>
            setMenuAbierto(
              (
                estadoActual,
              ) =>
                !estadoActual,
            )
          }
        >
          {menuAbierto ? (
            <FaTimes
              aria-hidden="true"
            />
          ) : (
            <FaBars
              aria-hidden="true"
            />
          )}
        </button>

        {/* ========================================
            NAVEGACIÓN
        ======================================== */}

        <nav
          className={`navbar__navigation ${
            menuAbierto
              ? "navbar__navigation--open"
              : ""
          }`}
          aria-label="Navegación principal"
        >
          {/* ========================================
              INICIO
          ======================================== */}

          <NavLink
            to="/"
            end
            className={
              obtenerClaseLink
            }
            onClick={
              cerrarMenu
            }
          >
            Inicio
          </NavLink>

          {/* ========================================
              MENÚ
          ======================================== */}

          <NavLink
            to="/menu"
            className={
              obtenerClaseLink
            }
            onClick={
              cerrarMenu
            }
          >
            Menú
          </NavLink>

          {/* ========================================
              COMBOS LOONGIS
          ======================================== */}

          <Link
            to="/#combos-loongis"
            className="navbar__link"
            onClick={
              cerrarMenu
            }
          >
            Combos
          </Link>

          {/* ========================================
              NOSOTROS
          ======================================== */}

          <Link
            to="/#nosotros"
            className="navbar__link"
            onClick={
              cerrarMenu
            }
          >
            Nosotros
          </Link>

          {/* ========================================
              CONTACTO
          ======================================== */}

          <Link
            to="/#contacto"
            className="navbar__link"
            onClick={
              cerrarMenu
            }
          >
            Contacto
          </Link>
        </nav>

        {/* ========================================
            MI PEDIDO
        ======================================== */}

        <button
          className="navbar__order-button"
          type="button"
          aria-label={`Ver mi pedido. ${totalUnits} unidades`}
          onClick={
            abrirCarrito
          }
        >
          <FaShoppingBag
            aria-hidden="true"
          />

          <span>
            Mi pedido
          </span>

          <span className="navbar__cart-count">
            {totalUnits}
          </span>
        </button>
      </div>
    </header>
  );
}
