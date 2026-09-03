import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  FaFire,
} from "react-icons/fa6";

import {
  AddToCartButton,
} from "../components/AddToCartButton";

import {
  CatalogImage,
} from "../components/CatalogImage";

import {
  MenuSkeleton,
} from "../components/MenuSkeleton";

import {
  useProducts,
} from "../hooks/useProducts";

import type {
  ProductCategory,
} from "../types/Product";

import "../styles/Menu.css";

/* ========================================
   TIPOS
======================================== */

type MenuFilter =
  | "todos"
  | "hamburguesas"
  | "combos"
  | "papas";

type ProductMenuCategory =
  | "hamburguesas"
  | "combos"
  | "papas";

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

  {
    id: "papas",
    label: "Papas",
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
    value === "combos" ||
    value === "papas"
  );
}

function isMenuCategory(
  category:
    | ProductCategory
    | undefined,
): category is ProductMenuCategory {
  return (
    category ===
      "hamburguesas" ||
    category ===
      "combos" ||
    category ===
      "papas"
  );
}

function getMenuCategoryOrder(
  category:
    | ProductCategory
    | undefined,
): number {
  if (
    category ===
    "hamburguesas"
  ) {
    return 0;
  }

  if (
    category ===
    "combos"
  ) {
    return 1;
  }

  if (
    category ===
    "papas"
  ) {
    return 2;
  }

  return 3;
}

function getCategoryLabel(
  category:
    | ProductCategory
    | undefined,
): string {
  if (
    category ===
    "hamburguesas"
  ) {
    return "Hamburguesas";
  }

  if (
    category ===
    "combos"
  ) {
    return "Combos";
  }

  if (
    category ===
    "papas"
  ) {
    return "Papas";
  }

  return "Producto";
}

function formatPrice(
  price: number,
) {
  return `$ ${price.toLocaleString(
    "es-AR",
  )}`;
}

/* ========================================
   COMPONENTE
======================================== */

export function Menu() {
  const {
    products,
    loading,
    error,
  } =
    useProducts();

  const [
    searchParams,
    setSearchParams,
  ] =
    useSearchParams();

  const categoryParameter =
    searchParams.get(
      "categoria",
    );

  const activeFilter:
    MenuFilter =
    isMenuFilter(
      categoryParameter,
    )
      ? categoryParameter
      : "todos";

  const menuProducts =
    [...products]
      .filter(
        (product) =>
          isMenuCategory(
            product.category,
          ),
      )
      .sort(
        (
          firstProduct,
          secondProduct,
        ) => {
          const categoryDifference =
            getMenuCategoryOrder(
              firstProduct.category,
            ) -
            getMenuCategoryOrder(
              secondProduct.category,
            );

          if (
            categoryDifference !==
            0
          ) {
            return categoryDifference;
          }

          if (
            firstProduct.category !==
              "combos" ||
            secondProduct.category !==
              "combos"
          ) {
            return 0;
          }

          return (
            Number(
              secondProduct.dailyPromo ===
                true,
            ) -
            Number(
              firstProduct.dailyPromo ===
                true,
            )
          );
        },
      );

  const visibleProducts =
    activeFilter === "todos"
      ? menuProducts
      : menuProducts.filter(
          (product) =>
            product.category ===
            activeFilter,
        );

  const handleFilterChange = (
    filter: MenuFilter,
  ) => {
    if (
      filter === "todos"
    ) {
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

          <div className="menu-hero__layout">

            <div className="menu-hero__content">

              <span className="menu-hero__eyebrow">
                Menú Loongis
              </span>

              <h1 className="menu-hero__title">
                Elegí tu favorita
              </h1>

              <p className="menu-hero__description">
                Hamburguesas smash,
                combos y papas para
                disfrutar Loongis como
                más te gusta.
              </p>

              <span className="menu-hero__brand-tag">
                Smash · hechas al
                momento
              </span>
            </div>

            <div
              className="menu-hero__visual"
              aria-hidden="true"
            >
              <div className="menu-hero__visual-glow" />

              <img
                src="/images/hero/menu-loongis.png"
                alt=""
                className="menu-hero__visual-image"
              />
            </div>
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

          {/* =============================
              HEADER
          ============================= */}

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

            {!loading &&
              !error && (
                <p
                  className="menu-products__count"
                  aria-live="polite"
                >
                  {productsCount}{" "}
                  {productsCount ===
                  1
                    ? "producto"
                    : "productos"}
                </p>
              )}
          </header>

          {/* =============================
              FILTROS
          ============================= */}

          <div
            className="menu-filters"
            aria-label="Filtrar productos"
          >
            {menuFilters.map(
              (filter) => {
                const isActive =
                  activeFilter ===
                  filter.id;

                return (
                  <button
                    key={
                      filter.id
                    }
                    type="button"
                    className={
                      isActive
                        ? "menu-filter menu-filter--active"
                        : "menu-filter"
                    }
                    aria-pressed={
                      isActive
                    }
                    onClick={() =>
                      handleFilterChange(
                        filter.id,
                      )
                    }
                  >
                    {
                      filter.label
                    }
                  </button>
                );
              },
            )}
          </div>

          {/* =============================
              SKELETON
          ============================= */}

          {loading && (
            <MenuSkeleton />
          )}

          {/* =============================
              ERROR
          ============================= */}

          {!loading &&
            error && (
              <div
                className="menu-products__empty"
                role="alert"
              >
                <h3>
                  No pudimos cargar el
                  menú
                </h3>

                <p>
                  {error}
                </p>
              </div>
            )}

          {/* =============================
              GRILLA
          ============================= */}

          {!loading &&
          !error &&
          visibleProducts.length >
            0 ? (
            <div className="menu-products__grid">

              {visibleProducts.map(
                (product) => (
                  <article
                    key={
                      product.id
                    }
                    className={[
                      "menu-product-card",
                      `menu-product-card--${product.id}`,
                      `menu-product-card--${product.category ?? "sin-categoria"}`,
                      product.dailyPromo
                        ? "menu-product-card--daily"
                        : "",
                    ].join(
                      " ",
                    )}
                  >
                    <Link
                      to={`/producto/${product.id}`}
                      className="menu-product-card__image-link"
                      aria-label={`Ver detalle de ${product.name}`}
                    >
                      <div className="menu-product-card__image-wrapper">

                        {product.dailyPromo && (
                          <span className="menu-product-card__daily-badge">
                            <FaFire aria-hidden="true" />
                            Combo del día
                          </span>
                        )}

                        <CatalogImage
                          src={
                            product.image
                          }
                          alt={
                            product.imageAlt
                          }
                          className="menu-product-card__image"
                          variant="card"
                          sizes="(max-width: 800px) 90vw, 44vw"
                          loading="lazy"
                        />
                      </div>
                    </Link>

                    <div className="menu-product-card__content">

                      <div className="menu-product-card__meta">
                        <span className="menu-product-card__category">
                          {getCategoryLabel(
                            product.category,
                          )}
                        </span>

                        {product.category ===
                          "hamburguesas" && (
                          <span className="menu-product-card__included">
                            Incluye papas
                          </span>
                        )}
                      </div>

                      <h3 className="menu-product-card__name">

                        <Link
                          to={`/producto/${product.id}`}
                        >
                          {
                            product.name
                          }
                        </Link>
                      </h3>

                      <p className="menu-product-card__description">
                        {
                          product.description
                        }
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

                          {product.choiceGroups &&
                          product.choiceGroups.length > 0 ? (
                            <Link
                              to={`/producto/${product.id}`}
                              className="menu-product-card__button"
                            >
                              Elegir
                            </Link>
                          ) : (
                            <AddToCartButton
                              product={
                                product
                              }
                              className="menu-product-card__button"
                            />
                          )}
                        </div>
                      </footer>
                    </div>
                  </article>
                ),
              )}
            </div>
          ) : null}

          {/* =============================
              VACÍO
          ============================= */}

          {!loading &&
            !error &&
            visibleProducts.length ===
              0 && (
              <div className="menu-products__empty">

                <h3>
                  No encontramos
                  productos
                </h3>

                <p>
                  Probá seleccionando
                  otra categoría del
                  menú.
                </p>
              </div>
            )}
        </div>
      </section>
    </main>
  );
}
