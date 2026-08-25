import { Link } from "react-router-dom";

import { AddToCartButton } from "./AddToCartButton";

import type {
  Product,
} from "../types/Product";

import "../styles/FeaturedProducts.css";

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

type FeaturedProductsProps = {
  products: Product[];
  loading: boolean;
  error: string | null;
};

/* ========================================
   COMPONENTE
======================================== */

export function FeaturedProducts({
  products,
  loading,
  error,
}: FeaturedProductsProps) {
  const featuredProducts =
    products.filter(
      (product) =>
        product.featured === true &&
        product.available !== false,
    );

  /*
    Mientras cargamos o si el backend
    falla, no rompemos el Home.

    Las demás secciones siguen
    funcionando normalmente.
  */

  if (
    loading ||
    error ||
    featuredProducts.length === 0
  ) {
    return null;
  }

  return (
    <section
      className="featured-products"
      id="destacadas"
      aria-labelledby="featured-products-title"
    >
      <div className="featured-products__container">
        <header className="featured-products__header">
          <span
            className="featured-products__line"
            aria-hidden="true"
          />

          <h2
            className="featured-products__title"
            id="featured-products-title"
          >
            Las 3 principales
          </h2>

          <span
            className="featured-products__line"
            aria-hidden="true"
          />
        </header>

        <div className="featured-products__grid">
          {featuredProducts.map(
            (product) => (
              <article
                className={`featured-product featured-product--${product.id}`}
                key={product.id}
              >
                <Link
                  className="featured-product__image-link"
                  to={`/producto/${product.id}`}
                  aria-label={`Ver detalle de ${product.name}`}
                >
                  <div className="featured-product__visual">
                    <img
                      className="featured-product__image"
                      src={
                        product.image
                      }
                      alt={
                        product.imageAlt
                      }
                    />
                  </div>
                </Link>

                <div className="featured-product__content">
                  <h3 className="featured-product__name">
                    <Link
                      to={`/producto/${product.id}`}
                    >
                      {
                        product.name
                      }
                    </Link>
                  </h3>

                  <p className="featured-product__description">
                    {
                      product.description
                    }
                  </p>

                  <div className="featured-product__footer">
                    <strong className="featured-product__price">
                      {priceFormatter.format(
                        product.price,
                      )}
                    </strong>

                    <AddToCartButton
                      product={
                        product
                      }
                      className="featured-product__add"
                      label="Agregar"
                    />
                  </div>
                </div>
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  );
}