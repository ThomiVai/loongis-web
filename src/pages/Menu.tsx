import {
  useMemo,
  useState,
} from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { Link } from "react-router-dom";

import { AddToCartButton } from "../components/AddToCartButton";

import { menuProducts } from "../data/menuProducts";

import type {
  Product,
  ProductCategory,
} from "../types/Product";

import "../styles/Menu.css";

type ProductFilter =
  | "todos"
  | ProductCategory;

type CategoryOption = {
  value: ProductFilter;
  label: string;
};

const categories: CategoryOption[] = [
  {
    value: "todos",
    label: "Todos",
  },
  {
    value: "hamburguesas",
    label: "Hamburguesas",
  },
  {
    value: "combos",
    label: "Combos",
  },
  {
    value: "papas",
    label: "Papas",
  },
  {
    value: "bebidas",
    label: "Bebidas",
  },
  {
    value: "postres",
    label: "Postres",
  },
];

const categoryLabels: Record<
  ProductCategory,
  string
> = {
  hamburguesas: "Hamburguesas",
  combos: "Combos",
  papas: "Papas",
  bebidas: "Bebidas",
  postres: "Postres",
};

const priceFormatter =
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

function getProductCategory(
  product: Product,
): ProductCategory {
  return (
    product.category ?? "hamburguesas"
  );
}

export function Menu() {
  const [selectedCategory, setSelectedCategory] =
    useState<ProductFilter>("todos");

  const filteredProducts = useMemo(() => {
    return menuProducts.filter((product) => {
      const isAvailable =
        product.available !== false;

      if (!isAvailable) {
        return false;
      }

      if (selectedCategory === "todos") {
        return true;
      }

      return (
        getProductCategory(product) ===
        selectedCategory
      );
    });
  }, [selectedCategory]);

  return (
    <main className="menu-page">
      <section className="menu-hero">
        <div className="menu-page__container">
          <Link
            className="menu-hero__back"
            to="/"
          >
            <FaArrowLeftLong
              aria-hidden="true"
            />

            <span>Volver al inicio</span>
          </Link>

          <div className="menu-hero__content">
            <span className="menu-hero__eyebrow">
              Elegí tu favorita
            </span>

            <h1 className="menu-hero__title">
              Menú Loongis
            </h1>

            <p className="menu-hero__description">
              Hamburguesas smash, combos,
              papas, bebidas y algo dulce para
              cerrar el pedido.
            </p>
          </div>
        </div>
      </section>

      <section
        className="menu-products"
        aria-labelledby="menu-products-title"
      >
        <div className="menu-page__container">
          <div className="menu-products__header">
            <div>
              <span className="menu-products__eyebrow">
                Nuestro menú
              </span>

              <h2
                className="menu-products__title"
                id="menu-products-title"
              >
                Encontrá lo que estás buscando
              </h2>
            </div>

            <p className="menu-products__count">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "producto"
                : "productos"}
            </p>
          </div>

          <div
            className="menu-filters"
            aria-label="Filtrar productos por categoría"
          >
            {categories.map((category) => {
              const isActive =
                selectedCategory ===
                category.value;

              return (
                <button
                  className={`menu-filter ${
                    isActive
                      ? "menu-filter--active"
                      : ""
                  }`}
                  type="button"
                  key={category.value}
                  aria-pressed={isActive}
                  onClick={() =>
                    setSelectedCategory(
                      category.value,
                    )
                  }
                >
                  {category.label}
                </button>
              );
            })}
          </div>

          {filteredProducts.length > 0 ? (
            <div className="menu-products__grid">
              {filteredProducts.map(
                (product) => {
                  const productCategory =
                    getProductCategory(product);

                  return (
                    <article
                      className={`menu-product-card menu-product-card--${product.id} menu-product-card--${productCategory}`}
                      key={product.id}
                    >
                      <Link
                        className="menu-product-card__image-link"
                        to={`/producto/${product.id}`}
                        aria-label={`Ver detalle de ${product.name}`}
                      >
                        <div className="menu-product-card__image-wrapper">
                          <img
                            className="menu-product-card__image"
                            src={product.image}
                            alt={product.imageAlt}
                            loading="lazy"
                          />
                        </div>
                      </Link>

                      <div className="menu-product-card__content">
                        <span className="menu-product-card__category">
                          {
                            categoryLabels[
                              productCategory
                            ]
                          }
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

                        <div className="menu-product-card__footer">
                          <span className="menu-product-card__price">
                            {priceFormatter.format(
                              product.price,
                            )}
                          </span>

                          <div className="menu-product-card__actions">
                            <Link
                              className="menu-product-card__detail"
                              to={`/producto/${product.id}`}
                            >
                              Ver detalle
                            </Link>

                            <AddToCartButton
                              product={product}
                              className="menu-product-card__button"
                            />
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          ) : (
            <div className="menu-products__empty">
              <h3>
                No hay productos disponibles
              </h3>

              <p>
                Por el momento no encontramos
                productos en esta categoría.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}