import {
  type TouchEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FaChevronLeft,
  FaChevronRight,
  FaArrowRightLong,
} from "react-icons/fa6";

import {
  Link,
} from "react-router-dom";

import {
  AddToCartButton,
} from "./AddToCartButton";

import {
  BurgerCombosSkeleton,
} from "./HomeCatalogSkeletons";

import {
  CatalogImage,
} from "./CatalogImage";

import type {
  Product,
} from "../types/Product";

import "../styles/BurgerCombos.css";

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

type ComboCardPresentation = {
  badge: string;
  burgerImage: string;
  burgerCount: number;
  visualAlt: string;
};

const comboCardPresentations:
  Record<
    number,
    ComboCardPresentation
  > = {
  101: {
    badge: "1 doble",
    burgerImage:
      "/images/burgers/loongis-clasic.png",
    burgerCount: 1,
    visualAlt:
      "Hamburguesa doble Loongis con una porción de papas",
  },

  102: {
    badge: "3 simples",
    burgerImage:
      "/images/burgers/simple-queso.png",
    burgerCount: 3,
    visualAlt:
      "Tres hamburguesas simples Loongis con una porción de papas",
  },

  110: {
    badge: "Doble queso",
    burgerImage:
      "/images/burgers/simple-queso.png",
    burgerCount: 1,
    visualAlt:
      "Hamburguesa doble con queso y una porción de papas",
  },
};

function ComboCardArtwork({
  combo,
}: {
  combo: Product;
}) {
  const presentation =
    comboCardPresentations[
      combo.id
    ];

  if (!presentation) {
    return (
      <CatalogImage
        className="burger-combo-card__image"
        src={combo.image}
        alt={combo.imageAlt}
        variant="card"
        sizes="(max-width: 560px) 100vw, (max-width: 780px) 84vw, (max-width: 1100px) 68vw, 31vw"
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`burger-combo-card__artwork burger-combo-card__artwork--${combo.id}`}
      role="img"
      aria-label={
        presentation.visualAlt
      }
    >
      <CatalogImage
        className="burger-combo-card__fries"
        src="/images/fries/papas-comunes.png"
        alt=""
        variant="card"
        sizes="150px"
        loading="lazy"
        aria-hidden="true"
      />

      <div
        className="burger-combo-card__burgers"
        aria-hidden="true"
      >
        {Array.from({
          length:
            presentation.burgerCount,
        }).map((_, index) => (
          <CatalogImage
            className="burger-combo-card__burger"
            src={
              presentation.burgerImage
            }
            alt=""
            variant="card"
            sizes={
              presentation.burgerCount >
              1
                ? "155px"
                : "270px"
            }
            loading="lazy"
            aria-hidden="true"
            key={index}
          />
        ))}
      </div>
    </div>
  );
}

/* ========================================
   PROPS
======================================== */

type BurgerCombosProps = {
  products: Product[];
  loading: boolean;
  error: string | null;
};

/* ========================================
   COMPONENTE
======================================== */

export function BurgerCombos({
  products,
  loading,
  error,
}: BurgerCombosProps) {
  const viewportRef =
    useRef<HTMLDivElement>(null);

  const touchStartXRef =
    useRef<number | null>(null);

  const touchStartIndexRef =
    useRef(0);

  const [
    currentComboIndex,
    setCurrentComboIndex,
  ] = useState(0);

  /* ========================================
     COMBOS
  ======================================== */

  const burgerCombos =
    useMemo(
      () =>
        products.filter(
          (product) =>
            product.category ===
              "combos" &&
            product.dailyPromo !==
              true &&
            product.available !==
              false,
        ),
      [products],
    );

  const updateCurrentCombo = () => {
    const viewport =
      viewportRef.current;

    if (!viewport) {
      return;
    }

    const cards =
      Array.from(
        viewport.querySelectorAll<HTMLElement>(
          ".burger-combo-card",
        ),
      );

    if (cards.length === 0) {
      return;
    }

    let nearestIndex = 0;
    let nearestDistance =
      Number.POSITIVE_INFINITY;

    cards.forEach(
      (card, index) => {
        const distance = Math.abs(
          card.offsetLeft -
            viewport.scrollLeft,
        );

        if (
          distance <
          nearestDistance
        ) {
          nearestIndex = index;
          nearestDistance =
            distance;
        }
      },
    );

    setCurrentComboIndex(
      nearestIndex,
    );
  };

  const showCombo = (
    targetIndex: number,
  ) => {
    const viewport =
      viewportRef.current;

    if (!viewport) {
      return;
    }

    const cards =
      viewport.querySelectorAll<HTMLElement>(
        ".burger-combo-card",
      );

    if (cards.length === 0) {
      return;
    }

    const safeTargetIndex =
      ((targetIndex % cards.length) +
        cards.length) %
      cards.length;

    const targetCard =
      cards[safeTargetIndex];

    if (!targetCard) {
      return;
    }

    setCurrentComboIndex(
      safeTargetIndex,
    );

    viewport.scrollTo({
      left: targetCard.offsetLeft,
      behavior: "smooth",
    });
  };

  const handleTouchStart = (
    event: TouchEvent<HTMLDivElement>,
  ) => {
    touchStartXRef.current =
      event.touches[0]?.clientX ??
      null;

    touchStartIndexRef.current =
      currentComboIndex;
  };

  const handleTouchEnd = (
    event: TouchEvent<HTMLDivElement>,
  ) => {
    const touchStartX =
      touchStartXRef.current;

    const touchEndX =
      event.changedTouches[0]
        ?.clientX;

    touchStartXRef.current =
      null;

    if (
      touchStartX === null ||
      touchEndX === undefined
    ) {
      return;
    }

    const movement =
      touchEndX - touchStartX;

    if (Math.abs(movement) < 42) {
      return;
    }

    showCombo(
      touchStartIndexRef.current +
        (movement < 0 ? 1 : -1),
    );
  };

  useEffect(() => {
    const animationFrame =
      window.requestAnimationFrame(
        updateCurrentCombo,
      );

    const handleResize = () => {
      updateCurrentCombo();
    };

    window.addEventListener(
      "resize",
      handleResize,
    );

    return () => {
      window.cancelAnimationFrame(
        animationFrame,
      );

      window.removeEventListener(
        "resize",
        handleResize,
      );
    };
  }, [burgerCombos.length]);

  /* ========================================
     CARGANDO
  ======================================== */

  if (loading) {
    return (
      <BurgerCombosSkeleton />
    );
  }

  /* ========================================
     SIN DATOS
  ======================================== */

  if (
    error ||
    burgerCombos.length ===
      0
  ) {
    return null;
  }

  /* ========================================
     SECCIÓN
  ======================================== */

  return (
    <section
      className="burger-combos"
      id="combos-loongis"
      aria-labelledby="burger-combos-title"
    >
      <div className="burger-combos__container">

        {/* =================================
            HEADER
        ================================= */}

        <header className="burger-combos__header">

          <div className="burger-combos__heading">

            <span className="burger-combos__eyebrow">
              Para comer completo
            </span>

            <h2
              className="burger-combos__title"
              id="burger-combos-title"
            >
              Combos Loongis
            </h2>

            <p className="burger-combos__description">
              Elegí el combo que mejor
              va con vos. Todos vienen
              con sus papas crocantes.
            </p>
          </div>

          <Link
            className="burger-combos__menu-link"
            to="/menu"
          >
            <span>
              Ver menú completo
            </span>

            <FaArrowRightLong
              aria-hidden="true"
            />
          </Link>
        </header>

        {/* =================================
            GRILLA / DESLIZADOR RESPONSIVE
        ================================= */}

        <div className="burger-combos__carousel">
          <div
            className="burger-combos__viewport"
            ref={viewportRef}
            onScroll={updateCurrentCombo}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={() => {
              touchStartXRef.current =
                null;
            }}
          >

            <div
              className="burger-combos__grid"
              id="burger-combos-grid"
            >
              {burgerCombos.map(
                (combo) => (
                  <article
                    className={`burger-combo-card burger-combo-card--${combo.id}`}
                    key={
                      combo.id
                    }
                  >
                    <Link
                      className="burger-combo-card__image-link"
                      to={`/producto/${combo.id}`}
                      aria-label={`Ver detalle de ${combo.name}`}
                    >
                      <div className="burger-combo-card__visual">

                        <span className="burger-combo-card__badge">
                          {
                            comboCardPresentations[
                              combo.id
                            ]?.badge ??
                              "Combo"
                          }
                        </span>

                        <ComboCardArtwork
                          combo={combo}
                        />
                      </div>
                    </Link>

                    <div className="burger-combo-card__content">

                      <div>

                        <h3 className="burger-combo-card__name">

                          <Link
                            to={`/producto/${combo.id}`}
                          >
                            {
                              combo.name
                            }
                          </Link>
                        </h3>

                        <p className="burger-combo-card__description">
                          {
                            combo.description
                          }
                        </p>
                      </div>

                      <div className="burger-combo-card__footer">

                        <strong className="burger-combo-card__price">
                          {priceFormatter.format(
                            combo.price,
                          )}
                        </strong>

                        {combo.choiceGroups &&
                        combo.choiceGroups.length > 0 ? (
                          <Link
                            to={`/producto/${combo.id}`}
                            className="burger-combo-card__add"
                          >
                            Elegir combo
                          </Link>
                        ) : (
                          <AddToCartButton
                            product={
                              combo
                            }
                            className="burger-combo-card__add"
                            label="Agregar combo"
                          />
                        )}
                      </div>
                    </div>
                  </article>
                ),
              )}
            </div>
          </div>

          {burgerCombos.length > 1 && (
            <div
              className="burger-combos__navigation"
              role="group"
              aria-label="Navegación de combos"
            >
              <button
                className="burger-combos__navigation-button burger-combos__navigation-button--previous"
                type="button"
                onClick={() =>
                  showCombo(
                    currentComboIndex - 1,
                  )
                }
                aria-label="Ver combo anterior"
                aria-controls="burger-combos-grid"
              >
                <FaChevronLeft
                  aria-hidden="true"
                />
              </button>

              <button
                className="burger-combos__navigation-button burger-combos__navigation-button--next"
                type="button"
                onClick={() =>
                  showCombo(
                    currentComboIndex + 1,
                  )
                }
                aria-label="Ver siguiente combo"
                aria-controls="burger-combos-grid"
              >
                <FaChevronRight
                  aria-hidden="true"
                />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
