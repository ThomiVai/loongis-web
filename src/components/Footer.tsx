import {
  FaInstagram,
  FaLock,
  FaWhatsapp,
} from "react-icons/fa6";

import {
  Link,
} from "react-router-dom";

import "../styles/Footer.css";

const currentYear =
  new Date().getFullYear();

export function Footer() {
  return (
    <footer
      className="site-footer"
      id="contacto"
    >
      <svg
        className="site-footer__wave"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 0H1440V34C1300 62 1170 12 1025 35C860 61 760 11 600 37C430 64 300 8 145 35C90 44 43 44 0 38V0Z" />
      </svg>

      <div className="site-footer__container">
        <div className="site-footer__main">

          {/* ========================================
              MARCA
          ======================================== */}

          <div className="site-footer__brand">
            <img
              className="site-footer__logo"
              src="/images/logos/loongis-footer.jpeg"
              alt="Loongis"
            />

            <p className="site-footer__description">
              Hamburguesas hechas con
              amor, para los que aman
              comer rico.
            </p>

            <div
              className="site-footer__socials"
              aria-label="Redes sociales de Loongis"
            >
              <button
                className="site-footer__social-button"
                type="button"
                aria-label="Instagram de Loongis, próximamente"
                title="Instagram próximamente"
                disabled
              >
                <FaInstagram
                  aria-hidden="true"
                />
              </button>

              <button
                className="site-footer__social-button"
                type="button"
                aria-label="WhatsApp de Loongis, próximamente"
                title="WhatsApp próximamente"
                disabled
              >
                <FaWhatsapp
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          {/* ========================================
              NAVEGACIÓN
          ======================================== */}

          <nav
            className="site-footer__column"
            aria-label="Navegación del pie de página"
          >
            <h2 className="site-footer__column-title">
              Navegación
            </h2>

            <Link to="/">
              Inicio
            </Link>

            <Link to="/menu">
              Menú
            </Link>

            <Link to="/#combos-loongis">
              Combos
            </Link>

            <Link to="/#nosotros">
              Nosotros
            </Link>

            <Link to="/#contacto">
              Contacto
            </Link>
          </nav>

          {/* ========================================
              PEDIDOS
          ======================================== */}

          <div className="site-footer__column">
            <h2 className="site-footer__column-title">
              Pedidos
            </h2>

            <span>
              Envíos solo en Hurlingham
            </span>

            <span>
              Retiro por el local
            </span>

            <span>
              Efectivo
            </span>

            <span>
              Transferencia
            </span>
          </div>

          {/* ========================================
              HORARIOS
          ======================================== */}

          <div className="site-footer__column site-footer__schedule">
            <h2 className="site-footer__column-title">
              Horarios
            </h2>

            <p>
              Jueves a domingo
            </p>

            <strong>
              19:00 a 00:00
            </strong>

            <p className="site-footer__location">
              Hurlingham,
              Buenos Aires
            </p>

            <span>
              Envíos únicamente en
              Hurlingham
            </span>
          </div>

          {/* ========================================
              MASCOTA
          ======================================== */}

          <div className="site-footer__mascot-wrapper">
            <img
              className="site-footer__mascot"
              src="/mascot/promo-dog.png"
              alt="Mascota de Loongis"
            />
          </div>
        </div>

        {/* ========================================
            PARTE INFERIOR
        ======================================== */}

        <div className="site-footer__bottom">

          <span className="site-footer__copyright">
            © {currentYear} Loongis.
            Todos los derechos
            reservados.
          </span>

          {/* ======================================
              ACCESO ENCARGADOS
          ====================================== */}

          <Link
            className="site-footer__admin-link"
            to="/admin"
            aria-label="Ingresar al panel de administración de Loongis"
          >
            <FaLock
              aria-hidden="true"
            />

            <span>
              Acceso encargados
            </span>
          </Link>

          <span className="site-footer__made-with">
            Hecho con amor y muchas
            hamburguesas.
          </span>
        </div>
      </div>
    </footer>
  );
}