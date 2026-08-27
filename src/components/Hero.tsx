import {
  FaArrowRight,
  FaClock,
  FaLocationDot,
  FaStar,
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
      <div className="container hero__container">

        {/* ========================================
            CONTENIDO
        ======================================== */}

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

          {/* ========================================
              BENEFICIOS
          ======================================== */}

          <div className="hero__benefits">

            <article className="hero__benefit">

              <span className="hero__benefit-icon">
                <FaClock
                  aria-hidden="true"
                />
              </span>

              <div>
                <strong>
                  Preparadas
                </strong>

                <span>
                  al momento
                </span>
              </div>
            </article>

            <article className="hero__benefit">

              <span className="hero__benefit-icon">
                <FaLocationDot
                  aria-hidden="true"
                />
              </span>

              <div>
                <strong>
                  Envíos en
                </strong>

                <span>
                  tu zona
                </span>
              </div>
            </article>

            <article className="hero__benefit">

              <span className="hero__benefit-icon">
                <FaStar
                  aria-hidden="true"
                />
              </span>

              <div>
                <strong>
                  4.9 ★
                </strong>

                <span>
                  Clientes felices
                </span>
              </div>
            </article>
          </div>
        </div>

        {/* ========================================
            VISUAL
        ======================================== */}

        <div className="hero__visual">

          <div className="hero__image-frame">

            <img
              className="hero__main-image"
              src="/images/hero/hero-loongis.webp"
              srcSet="
                /images/hero/hero-loongis-1000.webp 1000w,
                /images/hero/hero-loongis.webp 1254w
              "
              sizes="
                (max-width: 550px) 500px,
                (max-width: 900px) 690px,
                (max-width: 1150px) 660px,
                710px
              "
              width="1254"
              height="1254"
              loading="eager"
              fetchPriority="high"
              alt="Mascota de Loongis junto a una hamburguesa Loongis Clasic"
            />
          </div>
        </div>
      </div>
    </section>
  );
}