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
  FeaturedProductsSkeleton,
} from "./HomeCatalogSkeletons";

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
  /* ========================================
     CARGANDO
  ======================================== */

  if (loading) {
    return (
      <FeaturedProductsSkeleton />
    );
  }

  /* ========================================
     DESTACADAS
  ======================================== */

  const featuredProducts =
    products.filter(
      (product) =>
        product.featured ===
          true &&
        product.available !==
          false,
    );

  /* ========================================
     SIN DATOS
  ======================================== */

  if (
    error ||
    featuredProducts.length ===
      0
  ) {
    return null;
  }

  /* ========================================
     SECCIÓN
  ======================================== */

  return (
    <section
      className="featured-products"
      id="destacadas"
      aria-labelledby="featured-products-title"
    >
      <div className="featured-products__container">

        {/* =================================
            HEADER
        ================================= */}

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

        {/* =================================
            PRODUCTOS
        ================================= */}

        <div className="featured-products__grid">

          {featuredProducts.map(
            (product) => (
              <article
                className={`featured-product featured-product--${product.id}`}
                key={
                  product.id
                }
              >
                <Link
                  className="featured-product__image-link"
                  to={`/producto/${product.id}`}
                  aria-label={`Ver detalle de ${product.name}`}
                >
                  <div className="featured-product__visual">

                    <CatalogImage
                      className="featured-product__image"
                      src={
                        product.image
                      }
                      alt={
                        product.imageAlt
                      }
                      variant="card"
                      sizes="(max-width: 780px) 90vw, (max-width: 850px) 44vw, 30vw"
                      loading="lazy"
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

                  <span className="featured-product__included">
                    Incluye papas
                  </span>

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

                    {product.choiceGroups &&
                    product.choiceGroups.length > 0 ? (
                      <Link
                        to={`/producto/${product.id}`}
                        className="featured-product__add"
                      >
                        Elegir
                      </Link>
                    ) : (
                      <AddToCartButton
                        product={
                          product
                        }
                        className="featured-product__add"
                        label="Agregar"
                      />
                    )}
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
