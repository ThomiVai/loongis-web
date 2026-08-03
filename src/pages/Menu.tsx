import {
  Link,
  useSearchParams,
} from "react-router-dom";

import { AddToCartButton } from "../components/AddToCartButton";
import { menuProducts } from "../data/menuProducts";

import "../styles/Menu.css";

/* ========================================
   TIPOS
======================================== */

type MenuFilter =
  | "todos"
  | "hamburguesas"
  | "combos";

type ProductMenuCategory =
  | "hamburguesas"
  | "combos";

/* ========================================
   FILTROS
======================================== */

const menuFilters: {
  id: MenuFilter;
  label: string;
}[] = [
  {
    id: "todos",
    label: "Todos",
  },
  {
    id: "hamburguesas",
    label: "Hamburguesas",
  },
  {
    id: "combos",
    label: "Combos",
  },
];

/* ========================================
   FUNCIONES AUXILIARES
======================================== */

function isMenuFilter(
  value: string | null,
): value is MenuFilter {
  return (
    value === "todos" ||
    value === "hamburguesas" ||
    value === "combos"
  );
}

function getCategoryLabel(
  category: ProductMenuCategory,
) {
  if (category === "hamburguesas") {
    return "Hamburguesas";
  }

  return "Combos";
}

function formatPrice(price: number) {
  return `$ ${price.toLocaleString("es-AR")}`;
}

/* ========================================
   COMPONENTE
======================================== */

export function Menu() {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const categoryParameter =
    searchParams.get("categoria");

  const activeFilter: MenuFilter =
    isMenuFilter(categoryParameter)
      ? categoryParameter
      : "todos";

  const visibleProducts =
    activeFilter === "todos"
      ? menuProducts
      : menuProducts.filter(
          (product) =>
            product.productCategory ===
            activeFilter,
        );

  const handleFilterChange = (
    filter: MenuFilter,
  ) => {
    if (filter === "todos") {
      setSearchParams({});
      return;
    }

    setSearchParams({
      categoria: filter,
    });
  };

  const productsCount =
    visibleProducts.length;

  return (
    <main className="menu-page">
      {/* =================================
          PORTADA
      ================================= */}

      <section className="menu-hero">
        <div className="menu-page__container">
          <Link
            to="/"
            className="menu-hero__back"
          >
            <span aria-hidden="true">
              ←
            </span>

            Volver al inicio
          </Link>

          <div className="menu-hero__content">
            <span className="menu-hero__eyebrow">
              Menú Loongis
            </span>

            <h1 className="menu-hero__title">
              Elegí tu favorita
            </h1>

            <p className="menu-hero__description">
              Hamburguesas smash y combos
              para disfrutar Loongis como
              más te gusta.
            </p>
          </div>
        </div>
      </section>

      {/* =================================
          PRODUCTOS
      ================================= */}

      <section
        className="menu-products"
        aria-labelledby="menu-products-title"
      >
        <div className="menu-page__container">
          <header className="menu-products__header">
            <div>
              <span className="menu-products__eyebrow">
                Todo el sabor
              </span>

              <h2
                className="menu-products__title"
                id="menu-products-title"
              >
                Nuestro menú
              </h2>
            </div>

            <p
              className="menu-products__count"
              aria-live="polite"
            >
              {productsCount}{" "}
              {productsCount === 1
                ? "producto"
                : "productos"}
            </p>
          </header>

          {/* =============================
              FILTROS
          ============================= */}

          <div
            className="menu-filters"
            aria-label="Filtrar productos"
          >
            {menuFilters.map((filter) => {
              const isActive =
                activeFilter === filter.id;

              return (
                <button
                  key={filter.id}
                  type="button"
                  className={
                    isActive
                      ? "menu-filter menu-filter--active"
                      : "menu-filter"
                  }
                  aria-pressed={isActive}
                  onClick={() =>
                    handleFilterChange(
                      filter.id,
                    )
                  }
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* =============================
              GRILLA
          ============================= */}

          {visibleProducts.length > 0 ? (
            <div className="menu-products__grid">
              {visibleProducts.map(
                (product) => (
                  <article
                    key={product.id}
                    className={[
                      "menu-product-card",
                      `menu-product-card--${product.id}`,
                      `menu-product-card--${product.productCategory}`,
                    ].join(" ")}
                  >
                    {/* Imagen */}

                    <Link
                      to={`/producto/${product.id}`}
                      className="menu-product-card__image-link"
                      aria-label={`Ver detalle de ${product.name}`}
                    >
                      <div className="menu-product-card__image-wrapper">
                        <img
                          src={product.image}
                          alt={product.imageAlt}
                          className="menu-product-card__image"
                          loading="lazy"
                        />
                      </div>
                    </Link>

                    {/* Información */}

                    <div className="menu-product-card__content">
                      <span className="menu-product-card__category">
                        {getCategoryLabel(
                          product.productCategory,
                        )}
                      </span>

                      <h3 className="menu-product-card__name">
                        <Link
                          to={`/producto/${product.id}`}
                        >
                          {product.name}
                        </Link>
                      </h3>

                      <p className="menu-product-card__description">
                        {product.description}
                      </p>

                      <footer className="menu-product-card__footer">
                        <strong className="menu-product-card__price">
                          {formatPrice(
                            product.price,
                          )}
                        </strong>

                        <div className="menu-product-card__actions">
                          <Link
                            to={`/producto/${product.id}`}
                            className="menu-product-card__detail"
                          >
                            Ver detalle
                          </Link>

                          <AddToCartButton
                            product={product}
                            className="menu-product-card__button"
                          />
                        </div>
                      </footer>
                    </div>
                  </article>
                ),
              )}
            </div>
          ) : (
            <div className="menu-products__empty">
              <h3>
                No encontramos productos
              </h3>

              <p>
                Probá seleccionando otra
                categoría del menú.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}