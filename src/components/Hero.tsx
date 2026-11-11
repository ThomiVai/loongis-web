import {
  FaArrowRight,
  FaCalendarDays,
  FaClock,
  FaLocationDot,
} from "react-icons/fa6";

import {
  Link,
} from "react-router-dom";

import "../styles/Hero.css";

export function Hero() {
  return (
    <section
      className="hero"
      id="inicio"
    >
      <div className="hero__stage">
        <div className="hero__container">

        {/* ========================================
            CONTENIDO
        ======================================== */}

        <div className="hero__content">

          <h1 className="hero__title">

            <span className="hero__title-small">Hamburguesas</span>

            <span className="hero__title-primary hero__title-dark">que te hacen</span>

            <span className="hero__title-primary hero__title-underlined">
              babear
            </span>
          </h1>

          <p className="hero__description">
            Carne smash,
            ingredientes frescos y
            mucho amor en cada
            bocado.
          </p>

          {/* ========================================
              ACCIONES
          ======================================== */}

          <div className="hero__actions">

            <Link
              to="/menu"
              className="hero__button hero__button--primary"
            >
              Ver menú

              <FaArrowRight
                aria-hidden="true"
              />
            </Link>

            <Link
              to="/#combos"
              className="hero__button hero__button--secondary"
            >
              Ver promo del día

              <FaArrowRight
                aria-hidden="true"
              />
            </Link>
          </div>

        </div>

        {/* ========================================
            VISUAL
        ======================================== */}

        <div className="hero__visual">

          <div className="hero__halo hero__halo--yellow" aria-hidden="true" />
          <div className="hero__halo hero__halo--blue" aria-hidden="true" />
          <span className="hero__sparkle hero__sparkle--one" aria-hidden="true">✦</span>
          <span className="hero__sparkle hero__sparkle--two" aria-hidden="true">✦</span>

          <div className="hero__image-frame">

            <img
              className="hero__main-image"
              src="/images/burgers/combo-crispy.webp"
              sizes="
                (max-width: 550px) 500px,
                (max-width: 900px) 690px,
                (max-width: 1150px) 660px,
                710px
              "
              width="720"
              height="1280"
              loading="eager"
              fetchPriority="high"
              alt="Hamburguesa doble Loongis Crispy"
            />
          </div>
        </div>
      </div>

        <div className="hero__benefits" aria-label="Beneficios de Loongis">
          <article className="hero__benefit">
            <span className="hero__benefit-icon"><FaClock aria-hidden="true" /></span>
            <div><strong>Preparadas</strong><span>al momento</span></div>
          </article>

          <article className="hero__benefit">
            <span className="hero__benefit-icon"><FaLocationDot aria-hidden="true" /></span>
            <div><strong>Delivery</strong><span>en Hurlingham</span></div>
          </article>

          <article className="hero__benefit">
            <span className="hero__benefit-icon"><FaCalendarDays aria-hidden="true" /></span>
            <div><strong>Jueves a domingo</strong><span>20:00 a 00:00</span></div>
          </article>
        </div>
      </div>
    </section>
  );
}
