import {
  FaArrowRightLong,
  FaFire,
} from "react-icons/fa6";

import {
  Link,
} from "react-router-dom";

import {
  AddToCartButton,
} from "./AddToCartButton";

import {
  CatalogImage,
} from "./CatalogImage";

import {
  DailyPromoSkeleton,
} from "./HomeCatalogSkeletons";

import type {
  Product,
} from "../types/Product";

import "../styles/DailyPromo.css";

/* ========================================
   FORMATO DE PRECIO
======================================== */

const priceFormatter =
  new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    },
  );

/* ========================================
   PROPS
======================================== */

type DailyPromoProps = {
  products: Product[];
  loading: boolean;
  error: string | null;
};

/* ========================================
   COMPONENTE
======================================== */

export function DailyPromo({
  products,
  loading,
  error,
}: DailyPromoProps) {
  /* ========================================
     CARGANDO
  ======================================== */

  if (loading) {
    return (
      <DailyPromoSkeleton />
    );
  }

  /* ========================================
     PRODUCTO
  ======================================== */

  const promoCombo =
    products.find(
      (product) =>
        product.category ===
          "combos" &&
        product.dailyPromo ===
          true &&
        product.available !==
          false,
    ) ??
    products.find(
      (product) =>
        product.id === 101 &&
        product.category ===
          "combos" &&
        product.available !==
          false,
    );

  /* ========================================
     SIN DATOS
  ======================================== */

  if (
    error ||
    !promoCombo
  ) {
    return null;
  }

  const dailyBurgerLabel =
    promoCombo.choiceGroups
      ?.find(
        (group) =>
          group.id ===
          "hamburguesa-del-dia",
      )
      ?.options[0]
      ?.label;

  /* ========================================
     PROMO
  ======================================== */

  return (
    <section
      className="promo-banner"
      id="combos"
      aria-labelledby="promo-banner-title"
    >
      <div className="promo-banner__container">

        {/* =================================
            VISUAL
        ================================= */}

        <div className="promo-banner__visual">

          <span
            className="promo-banner__decoration"
            aria-hidden="true"
          />

          <div className="promo-banner__image-wrapper">

            <CatalogImage
              className="promo-banner__combo-image"
              src={
                promoCombo.image
              }
              alt={
                promoCombo.imageAlt
              }
              variant="full"
              sizes="(max-width: 780px) 90vw, 45vw"
              loading="lazy"
            />
          </div>

          <div className="promo-banner__discount">

            <strong>
              Promo
            </strong>

            <span>
              del día
            </span>
          </div>
        </div>

        {/* =================================
            CONTENIDO
        ================================= */}

        <div className="promo-banner__content">

          <div className="promo-banner__eyebrow">

            <FaFire
              aria-hidden="true"
            />

            <span>
              Promo especial
            </span>
          </div>

          <h2
            className="promo-banner__title"
            id="promo-banner-title"
          >
            Combo del día
          </h2>

          <h3 className="promo-banner__product-name">
            {dailyBurgerLabel
              ? `Hoy: ${dailyBurgerLabel}`
              : promoCombo.name}
          </h3>

          <p className="promo-banner__description">
            {
              promoCombo.description
            }
          </p>

          <div className="promo-banner__price">

            <span>
              Precio del combo
            </span>

            <strong>
              {priceFormatter.format(
                promoCombo.price,
              )}
            </strong>
          </div>

          <div className="promo-banner__actions">

            {promoCombo.choiceGroups &&
            promoCombo.choiceGroups.length > 0 ? (
              <Link
                className="promo-banner__add-button"
                to={`/producto/${promoCombo.id}`}
              >
                Elegir opciones
              </Link>
            ) : (
              <AddToCartButton
                product={
                  promoCombo
                }
                className="promo-banner__add-button"
                label="Agregar combo"
              />
            )}

            <Link
              className="promo-banner__detail-button"
              to={`/producto/${promoCombo.id}`}
            >
              <span>
                Ver detalle
              </span>

              <FaArrowRightLong
                aria-hidden="true"
              />
            </Link>
          </div>

          <p className="promo-banner__notice">
            Sujeto a disponibilidad.
          </p>
        </div>
      </div>
    </section>
  );
}
