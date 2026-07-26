import { useMemo, useState } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { Link } from "react-router-dom";

import { AddToCartButton } from "../components/AddToCartButton";

import { menuProducts as products } from "../data/menuProducts";

import type { Product, ProductCategory } from "../types/Product";

import "../styles/Menu.css";

type ProductFilter = "todos" | ProductCategory;

type MenuCategory = {
  id: ProductFilter;
  name: string;
  icon: string;
};

const categories: MenuCategory[] = [
  {
    id: "todos",
    name: "Todos",
    icon: "🍽️",
  },
  {
    id: "hamburguesas",
    name: "Hamburguesas",
    icon: "🍔",
  },
  {
    id: "combos",
    name: "Combos",
    icon: "🥤",
  },
  {
    id: "papas",
    name: "Papas",
    icon: "🍟",
  },
  {
    id: "bebidas",
    name: "Bebidas",
    icon: "🧃",
  },
  {
    id: "postres",
    name: "Postres",
    icon: "🍪",
  },
];

const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

function getProductCategory(product: Product): ProductCategory {
  /*
    Los productos que todavía no tengan categoría
    se consideran hamburguesas.
  */
  return product.category ?? "hamburguesas";
}

export function Menu() {
  const [activeCategory, setActiveCategory] = useState<ProductFilter>("todos");

  const availableProducts = useMemo(() => {
    return products.filter((product) => product.available !== false);
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "todos") {
      return availableProducts;
    }

    return availableProducts.filter(
      (product) => getProductCategory(product) === activeCategory,
    );
  }, [activeCategory, availableProducts]);

  const activeCategoryName =
    categories.find((category) => category.id === activeCategory)?.name ??
    "Productos";

  return (
    <main className="menu-page">
      <section className="menu-page__hero" aria-labelledby="menu-page-title">
        <div className="menu-page__container">
          <Link className="menu-page__back" to="/">
            <FaArrowLeftLong aria-hidden="true" />

            <span>Volver al inicio</span>
          </Link>

          <div className="menu-page__heading">
            <span className="menu-page__eyebrow">Elegí tu favorita</span>

            <h1 className="menu-page__title" id="menu-page-title">
              Nuestro menú
            </h1>

            <p className="menu-page__subtitle">
              Hamburguesas smash preparadas al momento, combos, acompañamientos
              y todo el sabor de Loongis.
            </p>
          </div>
        </div>
      </section>

      <section className="menu-products" aria-label="Productos del menú">
        <div className="menu-page__container">
          <div
            className="menu-filters"
            aria-label="Filtrar productos por categoría"
          >
            <div className="menu-filters__header">
              <div>
                <span className="menu-filters__label">Categorías</span>

                <h2 className="menu-filters__title">
                  ¿Qué tenés ganas de comer?
                </h2>
              </div>

              <span className="menu-filters__result">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "producto" : "productos"}
              </span>
            </div>

            <div className="menu-filters__list">
              {categories.map((category) => {
                const isActive = activeCategory === category.id;

                return (
                  <button
                    className={`menu-filter-button ${
                      isActive ? "menu-filter-button--active" : ""
                    }`}
                    type="button"
                    key={category.id}
                    aria-pressed={isActive}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    <span
                      className="menu-filter-button__icon"
                      aria-hidden="true"
                    >
                      {category.icon}
                    </span>

                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="menu-products__header">
            <div>
              <span className="menu-products__label">
                {activeCategory === "todos"
                  ? "Menú completo"
                  : "Categoría seleccionada"}
              </span>

              <h2 className="menu-products__title">{activeCategoryName}</h2>
            </div>

            <span className="menu-products__count">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "producto" : "productos"}
            </span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="menu-products__grid">
              {filteredProducts.map((product) => (
                <article className="menu-product-card" key={product.id}>
                  <div className="menu-product-card__image-wrapper">
                    <img
                      className="menu-product-card__image"
                      src={product.image}
                      alt={product.imageAlt}
                    />
                  </div>

                  <div className="menu-product-card__content">
                    <span className="menu-product-card__category">
                      {
                        categories.find(
                          (category) =>
                            category.id === getProductCategory(product),
                        )?.name
                      }
                    </span>

                    <h3 className="menu-product-card__name">{product.name}</h3>

                    <p className="menu-product-card__description">
                      {product.description}
                    </p>

                    <div className="menu-product-card__footer">
                      <span className="menu-product-card__price">
                        {priceFormatter.format(product.price)}
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
              ))}
            </div>
          ) : (
            <div className="menu-products-empty">
              <span className="menu-products-empty__icon" aria-hidden="true">
                🍔
              </span>

              <h3 className="menu-products-empty__title">
                Todavía no hay productos en esta categoría
              </h3>

              <p className="menu-products-empty__description">
                Estamos preparando nuevas opciones para agregar al menú.
              </p>

              <button
                className="menu-products-empty__button"
                type="button"
                onClick={() => setActiveCategory("todos")}
              >
                Ver todos los productos
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
