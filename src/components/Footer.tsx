import { FaInstagram, FaWhatsapp } from "react-icons/fa6";

import "../styles/Footer.css";

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="site-footer" id="contacto">
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
          <div className="site-footer__brand">
            <img
              className="site-footer__logo"
              src="images/logos/loongis-footer.jpeg"
              alt="Loongis"
            />

            <p className="site-footer__description">
              Hamburguesas hechas con amor, para los que aman comer rico.
            </p>

            <div
              className="site-footer__socials"
              aria-label="Redes sociales de Loongis"
            >
              <button
                className="site-footer__social-button"
                type="button"
                aria-label="Instagram de Loongis"
              >
                <FaInstagram aria-hidden="true" />
              </button>

              <button
                className="site-footer__social-button"
                type="button"
                aria-label="WhatsApp de Loongis"
              >
                <FaWhatsapp aria-hidden="true" />
              </button>
            </div>
          </div>

          <nav
            className="site-footer__column"
            aria-label="Navegación del pie de página"
          >
            <h2 className="site-footer__column-title">Navegación</h2>

            <a href="#inicio">Inicio</a>
            <a href="#featured-products-title">Menú</a>
            <a href="#daily-promo-title">Combos</a>
            <a href="#beneficios">Nosotros</a>
            <a href="#contacto">Contacto</a>
          </nav>

          <div className="site-footer__column">
            <h2 className="site-footer__column-title">Ayuda</h2>

            <button type="button">Preguntas frecuentes</button>

            <button type="button">Envíos</button>

            <button type="button">Cambios y devoluciones</button>

            <button type="button">Términos y condiciones</button>
          </div>

          <div className="site-footer__column site-footer__schedule">
            <h2 className="site-footer__column-title">Horarios</h2>

            <p>Jueves a domingo</p>

            <strong>19:00 a 00:00</strong>

            <p className="site-footer__location">Hurlingham, Buenos Aires</p>

            <a href="#contacto">Consultá tu zona de entrega</a>
          </div>

          <div className="site-footer__mascot-wrapper">
            <img
              className="site-footer__mascot"
              src="/mascot/promo-dog.png"
              alt="Mascota de Loongis"
            />
          </div>
        </div>

        <div className="site-footer__bottom">
          <span>© {currentYear} Loongis. Todos los derechos reservados.</span>

          <span className="site-footer__made-with">
            Hecho con amor y muchas hamburguesas.
          </span>
        </div>
      </div>
    </footer>
  );
}
