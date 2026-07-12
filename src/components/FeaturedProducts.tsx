import { FaPlus } from "react-icons/fa6";

import { products } from "../data/products";

import "../styles/FeaturedProducts.css";

const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function FeaturedProducts() {
  return (
    <section
      className="featured-products"
      aria-labelledby="featured-products-title"
    >
      <div className="featured-products__container">
        <div className="featured-products__heading">
          <span className="featured-products__line" />

          <h2
            id="featured-products-title"
            className="featured-products__title"
          >
            Las 3 principales
          </h2>

          <span className="featured-products__line" />
        </div>

        <div className="featured-products__grid">
          {products.map((product) => (
            <article
              className="featured-product"
              key={product.id}
            >
              <div className="featured-product__image-wrapper">
                <img
                  className="featured-product__image"
                  src={product.image}
                  alt={product.imageAlt}
                />
              </div>

              <div className="featured-product__content">
                <h3 className="featured-product__name">
                  {product.name}
                </h3>

                <p className="featured-product__description">
                  {product.description}
                </p>

                <div className="featured-product__footer">
                  <span className="featured-product__price">
                    {priceFormatter.format(product.price)}
                  </span>

                  <button
                    className="featured-product__button"
                    type="button"
                    aria-label={`Agregar ${product.name} al pedido`}
                  >
                    <FaPlus aria-hidden="true" />

                    <span>Agregar</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}