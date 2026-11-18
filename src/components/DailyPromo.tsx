import {
  FaArrowRightLong,
  FaFire,
} from "react-icons/fa6";

import {
  useEffect,
  useRef,
} from "react";

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

import {
  getDailyComboImage,
} from "../utils/dailyComboImage";

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
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const card = cardRef.current;

    if (!card || loading) {
      return;
    }

    const canTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const resetTilt = () => {
      card.classList.remove("is-tilting");
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (!canTilt || reduceMotion) return;
      const bounds = card.getBoundingClientRect();
      const x = Math.min(Math.max((event.clientX - bounds.left) / bounds.width, 0), 1);
      const y = Math.min(Math.max((event.clientY - bounds.top) / bounds.height, 0), 1);
      card.classList.add("is-tilting");
      card.style.setProperty("--tilt-x", `${(0.5 - y) * 12}deg`);
      card.style.setProperty("--tilt-y", `${(x - 0.5) * 12}deg`);
    };
    card.addEventListener("pointermove", handlePointerMove);
    card.addEventListener("pointerleave", resetTilt);
    card.addEventListener("pointercancel", resetTilt);

    if (reduceMotion) {
      card.classList.add("promo-banner__card--visible");
    }

    if (!("IntersectionObserver" in window)) {
      card.classList.add("promo-banner__card--visible");
      return () => {
        card.removeEventListener("pointermove", handlePointerMove);
        card.removeEventListener("pointerleave", resetTilt);
        card.removeEventListener("pointercancel", resetTilt);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        card.classList.toggle("promo-banner__card--visible", entry.isIntersecting);
      },
      { threshold: 0.25 },
    );

    observer.observe(card);

    return () => {
      observer.disconnect();
      card.removeEventListener("pointermove", handlePointerMove);
      card.removeEventListener("pointerleave", resetTilt);
      card.removeEventListener("pointercancel", resetTilt);
    };
  }, [loading]);
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
    return (
      <section className="promo-banner" id="combos" aria-labelledby="promo-banner-title">
        <article ref={cardRef} className="promo-banner__container promo-banner__card promo-banner__card--static">
          <div className="promo-banner__visual">
            <span className="promo-banner__decoration" aria-hidden="true" />
            <div className="promo-banner__image-wrapper">
            <img className="promo-banner__combo-image" src="/images/daily-combos/bacon-coca-cola.webp" alt="Combo Loongis Bacon con papas y Coca-Cola" />
            </div>
          </div>
          <div className="promo-banner__content">
            <div className="promo-banner__eyebrow"><FaFire aria-hidden="true" /><span>Promo especial</span></div>
            <h2 className="promo-banner__title" id="promo-banner-title">Combo del día</h2>
            <h3 className="promo-banner__product-name">Hoy: Loongis Bacon</h3>
            <p className="promo-banner__description">Hamburguesa doble del día, una porción de papas y bebida a elección.</p>
            <div className="promo-banner__price"><span>Precio del combo</span><strong>$16.000</strong></div>
            <div className="promo-banner__actions"><Link className="promo-banner__add-button" to="/producto/109">Elegir opciones</Link><Link className="promo-banner__detail-button" to="/producto/109">Ver detalle <FaArrowRightLong aria-hidden="true" /></Link></div>
            <p className="promo-banner__notice">Sujeto a disponibilidad.</p>
          </div>
        </article>
      </section>
    );
  }

  const dailyBurgerOption =
    promoCombo.choiceGroups
      ?.flatMap((group) => group.options)
      .find((option) => option.kind === "burger");

  const dailyBurgerLabel = dailyBurgerOption?.label;

  const defaultBeverageOption =
    promoCombo.choiceGroups
      ?.flatMap((group) => group.options)
      .find((option) =>
        option.kind === "beverage" &&
        option.label.toLowerCase().includes("coca"),
      );

  const dailyComboImage = getDailyComboImage(
    dailyBurgerOption,
    defaultBeverageOption ?? {
      id: "coca-cola",
      label: "Coca-Cola",
      kind: "beverage",
      ingredients: [],
    },
  );

  /* ========================================
     PROMO
  ======================================== */

  return (
    <section
      className="promo-banner"
      id="combos"
      aria-labelledby="promo-banner-title"
    >
      <article
        className="promo-banner__container promo-banner__card"
        ref={cardRef}
      >
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
                dailyComboImage ?? promoCombo.image
              }
              alt={
                dailyComboImage
                  ? `Combo del día con ${dailyBurgerLabel ?? "hamburguesa"}, papas y Coca-Cola`
                  : promoCombo.imageAlt
              }
              variant="full"
              sizes="(max-width: 780px) 90vw, 45vw"
              loading="lazy"
            />
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
      </article>
    </section>
  );
}
