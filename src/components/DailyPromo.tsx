import { FaArrowRightLong } from "react-icons/fa6";

import "../styles/DailyPromo.css";

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.5 2" />
      <path d="M9 2h6" />
    </svg>
  );
}

export function DailyPromo() {
  return (
    <section
      className="daily-promo"
      aria-labelledby="daily-promo-title"
    >
      <div className="daily-promo__container">
        <div className="promo-banner">
          <div className="promo-banner__brand">
            <div className="promo-banner__brand-circle" />

            <img
              className="promo-banner__mascot"
              src="images/logos/loongis-promo.png"
              alt="Mascota de Loongis enamorada de la promoción"
            />
          </div>

          <div className="promo-banner__content">
            <span className="promo-banner__eyebrow">
              Promo especial
            </span>

            <h2
              id="daily-promo-title"
              className="promo-banner__title"
            >
              Promo del día
            </h2>

            <p className="promo-banner__description">
              Combo Loongis + Papas + Gaseosa
            </p>

            <div className="promo-banner__prices">
              <span className="promo-banner__current-price">
                $12.500
              </span>

              <span className="promo-banner__previous-price">
                $15.800
              </span>
            </div>

            <div className="promo-banner__validity">
              <ClockIcon />

              <span>Válida hasta las 23:30 hs</span>
            </div>
          </div>

          <div className="promo-banner__visual">
            <img
              className="promo-banner__combo-image"
              src="/images/burgers/combo-promo.png"
              alt="Combo Loongis con hamburguesa, papas fritas y gaseosa"
            />

            <div
              className="promo-banner__discount"
              aria-label="20 por ciento de descuento"
            >
              <strong>20%</strong>
              <span>OFF</span>
            </div>

            <button
              className="promo-banner__button"
              type="button"
            >
              <span>¡La quiero!</span>

              <FaArrowRightLong aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}