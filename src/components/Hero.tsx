import {
  FaArrowRight,
  FaClock,
  FaLocationDot,
  FaStar,
} from "react-icons/fa6";

import "../styles/Hero.css";

export function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="container hero__container">
        <div className="hero__content">
          <h1 className="hero__title">
            <span className="hero__title-small">
              Hamburguesas que
            </span>

            <span className="hero__title-primary">
              te hacen
            </span>

            <span className="hero__title-primary hero__title-underlined">
              babear
            </span>
          </h1>

          <p className="hero__description">
            Carne smash, ingredientes frescos y mucho amor en cada bocado.
          </p>

          <div className="hero__actions">
            <a
              href="#menu"
              className="hero__button hero__button--primary"
            >
              Ver menú
              <FaArrowRight />
            </a>

            <a
              href="#promo-del-dia"
              className="hero__button hero__button--secondary"
            >
              Ver promo del día
              <FaArrowRight />
            </a>
          </div>

          <div className="hero__benefits">
            <article className="hero__benefit">
              <span className="hero__benefit-icon">
                <FaClock />
              </span>

              <div>
                <strong>Preparadas</strong>
                <span>al momento</span>
              </div>
            </article>

            <article className="hero__benefit">
              <span className="hero__benefit-icon">
                <FaLocationDot />
              </span>

              <div>
                <strong>Envíos en</strong>
                <span>tu zona</span>
              </div>
            </article>

            <article className="hero__benefit">
              <span className="hero__benefit-icon">
                <FaStar />
              </span>

              <div>
                <strong>4.9 ★</strong>
                <span>Clientes felices</span>
              </div>
            </article>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__yellow-shape" />

          <img
            className="hero__main-image"
            src="/images/hero/hero-loongis.png"
            alt="Mascota de Loongis asomándose detrás de una hamburguesa"
          />
        </div>
      </div>
    </section>
  );
}