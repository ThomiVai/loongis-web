import {
  FaArrowRightLong,
  FaFire,
} from "react-icons/fa6";
import { Link } from "react-router-dom";

import { AddToCartButton } from "./AddToCartButton";

import { menuProducts } from "../data/menuProducts";

import "../styles/DailyPromo.css";

const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function DailyPromo() {
  const promoCombo = menuProducts.find(
    (product) => product.id === 101,
  );

  if (!promoCombo) {
    return null;
  }

  return (
    <section
      className="promo-banner"
      id="combos"
      aria-labelledby="promo-banner-title"
    >
      <div className="promo-banner__container">
        <div className="promo-banner__visual">
          <span
            className="promo-banner__decoration promo-banner__decoration--one"
            aria-hidden="true"
          />

          <span
            className="promo-banner__decoration promo-banner__decoration--two"
            aria-hidden="true"
          />

          <img
            className="promo-banner__combo-image"
            src={promoCombo.image}
            alt={promoCombo.imageAlt}
          />

          <div className="promo-banner__discount">
            <strong>Promo</strong>
            <span>del día</span>
          </div>
        </div>

        <div className="promo-banner__content">
          <div className="promo-banner__eyebrow">
            <FaFire aria-hidden="true" />

            <span>Promo especial</span>
          </div>

          <h2
            className="promo-banner__title"
            id="promo-banner-title"
          >
            Combo del día
          </h2>

          <h3 className="promo-banner__product-name">
            {promoCombo.name}
          </h3>

          <p className="promo-banner__description">
            {promoCombo.description}
          </p>

          <ul className="promo-banner__includes">
            <li>Hamburguesa Loongis Clásica</li>
            <li>Porción de papas crocantes</li>
            <li>Bebida individual</li>
          </ul>

          <div className="promo-banner__price">
            <span>Precio del combo</span>

            <strong>
              {priceFormatter.format(promoCombo.price)}
            </strong>
          </div>

          <div className="promo-banner__actions">
            <AddToCartButton
              product={promoCombo}
              className="promo-banner__add-button"
              label="Agregar combo"
            />

            <Link
              className="promo-banner__detail-button"
              to={`/producto/${promoCombo.id}`}
            >
              <span>Ver detalle</span>

              <FaArrowRightLong aria-hidden="true" />
            </Link>
          </div>

          <p className="promo-banner__notice">
            Sujeto a disponibilidad. El sabor de la bebida se coordina al
            confirmar el pedido.
          </p>
        </div>
      </div>
    </section>
  );
}