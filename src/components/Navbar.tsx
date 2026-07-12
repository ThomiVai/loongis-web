import { useState } from "react";
import { FaBars, FaShoppingBag, FaTimes } from "react-icons/fa";
import "../styles/Navbar.css";

export function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  return (
    <header className="navbar">
      <div className="container navbar__container">
        <a href="#inicio" className="navbar__logo" onClick={cerrarMenu}>
          <img
            src="images/logos/loongis-logo.jpeg"
            alt="Logo de Loongis"
          />
        </a>

        <button
          className="navbar__mobile-button"
          type="button"
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuAbierto}
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          {menuAbierto ? <FaTimes /> : <FaBars />}
        </button>

        <nav
          className={`navbar__navigation ${
            menuAbierto ? "navbar__navigation--open" : ""
          }`}
        >
          <a
            href="#inicio"
            className="navbar__link navbar__link--active"
            onClick={cerrarMenu}
          >
            Inicio
          </a>

          <a href="#menu" className="navbar__link" onClick={cerrarMenu}>
            Menú
          </a>

          <a href="#combos" className="navbar__link" onClick={cerrarMenu}>
            Combos
          </a>

          <a href="#nosotros" className="navbar__link" onClick={cerrarMenu}>
            Nosotros
          </a>

          <a href="#contacto" className="navbar__link" onClick={cerrarMenu}>
            Contacto
          </a>
        </nav>

        <button className="navbar__order-button" type="button">
          <FaShoppingBag />

          <span>Mi pedido</span>

          <span className="navbar__cart-count">0</span>
        </button>
      </div>
    </header>
  );
}