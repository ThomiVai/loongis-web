import { FaArrowLeftLong } from "react-icons/fa6";
import { Link } from "react-router-dom";

import { AddToCartButton } from "../components/AddToCartButton";

import { products } from "../data/products";

import "../styles/Menu.css";

const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function Menu() {
  return (
    <main className="menu-page">
      <section
        className="menu-page__hero"
        aria-labelledby="menu-page-title"
      >
        <div className="menu-page__container">
          <Link
            className="menu-page__back"
            to="/"
          >
            <FaArrowLeftLong aria-hidden="true" />

            <span>Volver al inicio</span>
          </Link>

          <div className="menu-page__heading">
            <span className="menu-page__eyebrow">
              Elegí tu favorita
            </span>

            <h1
              className="menu-page__title"
              id="menu-page-title"
            >
              Nuestro menú
            </h1>

            <p className="menu-page__subtitle">
              Hamburguesas smash preparadas al momento, con ingredientes
              frescos y todo el sabor de Loongis.
            </p>
          </div>
        </div>
      </section>

      <section
        className="menu-products"
        aria-label="Productos del menú"
      >
        <div className="menu-page__container">
          <div className="menu-products__header">
            <div>
              <span className="menu-products__label">
                Hamburguesas
              </span>

              <h2 className="menu-products__title">
                Las favoritas de Loongis
              </h2>
            </div>

            <span className="menu-products__count">
              {products.length} productos
            </span>
          </div>

          <div className="menu-products__grid">
            {products.map((product) => (
              <article
                className="menu-product-card"
                key={product.id}
              >
                <div className="menu-product-card__image-wrapper">
                  <img
                    className="menu-product-card__image"
                    src={product.image}
                    alt={product.imageAlt}
                  />
                </div>

                <div className="menu-product-card__content">
                  <h3 className="menu-product-card__name">
                    {product.name}
                  </h3>

                  <p className="menu-product-card__description">
                    {product.description}
                  </p>

                  <div className="menu-product-card__footer">
                    <span className="menu-product-card__price">
                      {priceFormatter.format(product.price)}
                    </span>

                    <AddToCartButton
                      product={product}
                      className="menu-product-card__button"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="menu-products__notice">
            <strong>Próximamente</strong>

            <span>
              Vamos a agregar papas, bebidas, combos y más productos.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}