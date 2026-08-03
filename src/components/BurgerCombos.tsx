import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  FaArrowLeftLong,
  FaArrowRightLong,
} from "react-icons/fa6";
import { Link } from "react-router-dom";

import { AddToCartButton } from "./AddToCartButton";
import { menuProducts } from "../data/menuProducts";

import "../styles/BurgerCombos.css";

const priceFormatter = new Intl.NumberFormat(
  "es-AR",
  {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  },
);

function getInitialItemsPerPage(): number {
  if (typeof window === "undefined") {
    return 2;
  }

  return window.matchMedia(
    "(max-width: 780px)",
  ).matches
    ? 1
    : 2;
}

export function BurgerCombos() {
  const burgerCombos = useMemo(
  () =>
    menuProducts.filter(
      (product) =>
        product.productCategory === "combos",
    ),
  [],
);

  const [itemsPerPage, setItemsPerPage] =
    useState<number>(
      getInitialItemsPerPage,
    );

  const [currentPage, setCurrentPage] =
    useState(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(max-width: 780px)",
    );

    const handleScreenChange = (
      event: MediaQueryListEvent,
    ) => {
      setItemsPerPage(
        event.matches ? 1 : 2,
      );

      setCurrentPage(0);
    };

    mediaQuery.addEventListener(
      "change",
      handleScreenChange,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleScreenChange,
      );
    };
  }, []);

  if (burgerCombos.length === 0) {
    return null;
  }

  const totalPages = Math.max(
    1,
    Math.ceil(
      burgerCombos.length / itemsPerPage,
    ),
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages - 1,
  );

  const startIndex =
    safeCurrentPage * itemsPerPage;

  const visibleCombos =
    burgerCombos.slice(
      startIndex,
      startIndex + itemsPerPage,
    );

  const handlePrevious = () => {
    setCurrentPage((currentPageValue) =>
      currentPageValue === 0
        ? totalPages - 1
        : currentPageValue - 1,
    );
  };

  const handleNext = () => {
    setCurrentPage((currentPageValue) =>
      currentPageValue === totalPages - 1
        ? 0
        : currentPageValue + 1,
    );
  };

  const handlePageChange = (
    pageIndex: number,
  ) => {
    setCurrentPage(pageIndex);
  };

  return (
    <section
      className="burger-combos"
      id="combos-loongis"
      aria-labelledby="burger-combos-title"
    >
      <div className="burger-combos__container">
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
              Elegí tu hamburguesa favorita
              acompañada con papas crocantes y
              una bebida individual.
            </p>
          </div>

          <Link
            className="burger-combos__menu-link"
            to="/menu"
          >
            <span>Ver menú completo</span>

            <FaArrowRightLong
              aria-hidden="true"
            />
          </Link>
        </header>

        <div className="burger-combos__carousel">
          {totalPages > 1 && (
            <button
              className="burger-combos__control burger-combos__control--previous"
              type="button"
              aria-label="Ver combos anteriores"
              aria-controls="burger-combos-grid"
              onClick={handlePrevious}
            >
              <FaArrowLeftLong
                aria-hidden="true"
              />
            </button>
          )}

          <div className="burger-combos__viewport">
            <div
              className="burger-combos__grid"
              id="burger-combos-grid"
              key={`${safeCurrentPage}-${itemsPerPage}`}
            >
              {visibleCombos.map((combo) => (
                <article
                  className={`burger-combo-card burger-combo-card--${combo.id}`}
                  key={combo.id}
                >
                  <Link
                    className="burger-combo-card__image-link"
                    to={`/producto/${combo.id}`}
                    aria-label={`Ver detalle de ${combo.name}`}
                  >
                    <div className="burger-combo-card__visual">
                      <span className="burger-combo-card__badge">
                        Combo
                      </span>

                      <img
                        className="burger-combo-card__image"
                        src={combo.image}
                        alt={combo.imageAlt}
                      />
                    </div>
                  </Link>

                  <div className="burger-combo-card__content">
                    <div>
                      <h3 className="burger-combo-card__name">
                        <Link
                          to={`/producto/${combo.id}`}
                        >
                          {combo.name}
                        </Link>
                      </h3>

                      <p className="burger-combo-card__description">
                        {combo.description}
                      </p>
                    </div>

                    <div className="burger-combo-card__footer">
                      <strong className="burger-combo-card__price">
                        {priceFormatter.format(
                          combo.price,
                        )}
                      </strong>

                      <AddToCartButton
                        product={combo}
                        className="burger-combo-card__add"
                        label="Agregar"
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {totalPages > 1 && (
            <button
              className="burger-combos__control burger-combos__control--next"
              type="button"
              aria-label="Ver combos siguientes"
              aria-controls="burger-combos-grid"
              onClick={handleNext}
            >
              <FaArrowRightLong
                aria-hidden="true"
              />
            </button>
          )}
        </div>

        {totalPages > 1 && (
          <div
            className="burger-combos__pagination"
            aria-label="Páginas del carrusel de combos"
          >
            {Array.from({
              length: totalPages,
            }).map((_, index) => (
              <button
                className={`burger-combos__dot ${
                  safeCurrentPage === index
                    ? "burger-combos__dot--active"
                    : ""
                }`}
                type="button"
                key={index}
                aria-label={`Ir a la página ${
                  index + 1
                }`}
                aria-current={
                  safeCurrentPage === index
                    ? "true"
                    : undefined
                }
                onClick={() =>
                  handlePageChange(index)
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}