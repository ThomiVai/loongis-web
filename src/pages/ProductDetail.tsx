import {
  useState,
  type ChangeEvent,
} from "react";

import {
  FaArrowLeftLong,
  FaArrowRightLong,
  FaBagShopping,
  FaCircleCheck,
} from "react-icons/fa6";

import {
  Link,
  useParams,
} from "react-router-dom";

import { AddToCartButton } from "../components/AddToCartButton";

import { useProduct } from "../hooks/useProduct";

import type {
  Product,
  ProductCategory,
  ProductCustomization,
  ProductOption,
} from "../types/Product";

import "../styles/ProductDetail.css";
import "../styles/ProductAddedActions.css";

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
   NOMBRES DE CATEGORÍAS
======================================== */

const categoryNames: Record<
  ProductCategory,
  string
> = {
  hamburguesas:
    "Hamburguesas",
  combos: "Combos",
  papas: "Papas",
  bebidas: "Bebidas",
  postres: "Postres",
};

/* ========================================
   TAMAÑO POR DEFECTO
======================================== */

function getDefaultSizeId(
  sizeOptions?: ProductOption[],
): string {
  if (
    !sizeOptions ||
    sizeOptions.length === 0
  ) {
    return "";
  }

  const baseOption =
    sizeOptions.find(
      (option) =>
        option.priceModifier ===
        0,
    );

  return (
    baseOption?.id ??
    sizeOptions[0].id
  );
}

/* ========================================
   PROPS
======================================== */

type ProductDetailContentProps = {
  product: Product;
};

/* ========================================
   CONTENIDO DEL PRODUCTO
======================================== */

function ProductDetailContent({
  product,
}: ProductDetailContentProps) {
  /* ========================================
     ESTADOS DE PERSONALIZACIÓN
  ======================================== */

  const [
    selectedSizeId,
    setSelectedSizeId,
  ] = useState(() =>
    getDefaultSizeId(
      product.sizeOptions,
    ),
  );

  const [
    selectedExtraIds,
    setSelectedExtraIds,
  ] = useState<string[]>([]);

  const [
    removedIngredients,
    setRemovedIngredients,
  ] = useState<string[]>([]);

  const [
    notes,
    setNotes,
  ] = useState("");

  /* ========================================
     CONFIRMACIÓN POST-AGREGADO
  ======================================== */

  const [
    showAddedActions,
    setShowAddedActions,
  ] = useState(false);

  /* ========================================
     DATOS DEL PRODUCTO
  ======================================== */

  const productCategory =
    product.category ??
    "hamburguesas";

  const selectedSize =
    product.sizeOptions?.find(
      (option) =>
        option.id ===
        selectedSizeId,
    );

  const selectedExtras =
    product.extraOptions?.filter(
      (option) =>
        selectedExtraIds.includes(
          option.id,
        ),
    ) ?? [];

  /* ========================================
     PRECIO
  ======================================== */

  const extrasPrice =
    selectedExtras.reduce(
      (
        total,
        extra,
      ) =>
        total +
        extra.priceModifier,
      0,
    );

  const selectedPrice =
    Math.max(
      0,
      product.price +
        (
          selectedSize?.priceModifier ??
          0
        ) +
        extrasPrice,
    );

  /* ========================================
     PERSONALIZACIÓN FINAL
  ======================================== */

  const customization:
    ProductCustomization = {
      size: selectedSize,

      extras:
        selectedExtras,

      removedIngredients,

      notes:
        notes.trim(),
    };

  /* ========================================
     CAMBIO DE TAMAÑO
  ======================================== */

  const handleSizeChange = (
    optionId: string,
  ) => {
    setSelectedSizeId(
      optionId,
    );

    setShowAddedActions(
      false,
    );
  };

  /* ========================================
     EXTRAS
  ======================================== */

  const handleExtraChange = (
    optionId: string,
  ) => {
    setSelectedExtraIds(
      (currentIds) => {
        if (
          currentIds.includes(
            optionId,
          )
        ) {
          return currentIds.filter(
            (currentId) =>
              currentId !==
              optionId,
          );
        }

        return [
          ...currentIds,
          optionId,
        ];
      },
    );

    setShowAddedActions(
      false,
    );
  };

  /* ========================================
     INGREDIENTES
  ======================================== */

  const handleIngredientChange = (
    ingredient: string,
  ) => {
    setRemovedIngredients(
      (
        currentIngredients,
      ) => {
        if (
          currentIngredients.includes(
            ingredient,
          )
        ) {
          return currentIngredients.filter(
            (
              currentIngredient,
            ) =>
              currentIngredient !==
              ingredient,
          );
        }

        return [
          ...currentIngredients,
          ingredient,
        ];
      },
    );

    setShowAddedActions(
      false,
    );
  };

  /* ========================================
     ACLARACIONES
  ======================================== */

  const handleNotesChange = (
    event:
      ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setNotes(
      event.target.value,
    );

    setShowAddedActions(
      false,
    );
  };

  /* ========================================
     PRODUCTO AGREGADO
  ======================================== */

  const handleProductAdded =
    () => {
      setShowAddedActions(
        true,
      );
    };

  return (
    <main className="product-detail">
      <section
        className="product-detail__content"
        aria-labelledby="product-detail-title"
      >
        <div className="product-detail__container">
          {/* ========================================
              VOLVER
          ======================================== */}

          <Link
            className="product-detail__back"
            to="/menu"
          >
            <FaArrowLeftLong
              aria-hidden="true"
            />

            <span>
              Volver al menú
            </span>
          </Link>

          {/* ========================================
              LAYOUT
          ======================================== */}

          <div className="product-detail__layout">
            {/* ========================================
                VISUAL
            ======================================== */}

            <div className="product-detail__visual">
              <div className="product-detail__image-background">
                <span
                  className="product-detail__decoration product-detail__decoration--one"
                  aria-hidden="true"
                />

                <span
                  className="product-detail__decoration product-detail__decoration--two"
                  aria-hidden="true"
                />

                <img
                  className="product-detail__image"
                  src={
                    product.image
                  }
                  alt={
                    product.imageAlt
                  }
                />
              </div>
            </div>

            {/* ========================================
                INFORMACIÓN
            ======================================== */}

            <div className="product-detail__information">
              <span className="product-detail__category">
                {
                  categoryNames[
                    productCategory
                  ]
                }
              </span>

              <h1
                className="product-detail__title"
                id="product-detail-title"
              >
                {product.name}
              </h1>

              <p className="product-detail__description">
                {
                  product.description
                }
              </p>

              {/* ========================================
                  PRECIO
              ======================================== */}

              <div className="product-detail__price-row">
                <div>
                  <span className="product-detail__price-label">
                    Precio de tu
                    selección
                  </span>

                  <strong className="product-detail__price">
                    {priceFormatter.format(
                      selectedPrice,
                    )}
                  </strong>
                </div>

                {product.available !==
                false ? (
                  <span className="product-detail__available">
                    Disponible
                  </span>
                ) : (
                  <span className="product-detail__unavailable">
                    Sin stock
                  </span>
                )}
              </div>

              {/* ========================================
                  TAMAÑO
              ======================================== */}

              {product.sizeOptions &&
                product
                  .sizeOptions
                  .length >
                  0 && (
                  <fieldset className="product-customization">
                    <legend className="product-customization__title">
                      Elegí el tamaño
                    </legend>

                    <div className="product-customization__options">
                      {product.sizeOptions.map(
                        (
                          option,
                        ) => {
                          const isSelected =
                            selectedSizeId ===
                            option.id;

                          return (
                            <label
                              className={`product-option ${
                                isSelected
                                  ? "product-option--selected"
                                  : ""
                              }`}
                              key={
                                option.id
                              }
                            >
                              <input
                                type="radio"
                                name="product-size"
                                value={
                                  option.id
                                }
                                checked={
                                  isSelected
                                }
                                onChange={() =>
                                  handleSizeChange(
                                    option.id,
                                  )
                                }
                              />

                              <span className="product-option__information">
                                <strong>
                                  {
                                    option.name
                                  }
                                </strong>

                                <small>
                                  {option.priceModifier ===
                                  0
                                    ? "Precio base"
                                    : option.priceModifier >
                                        0
                                      ? `+ ${priceFormatter.format(
                                          option.priceModifier,
                                        )}`
                                      : `− ${priceFormatter.format(
                                          Math.abs(
                                            option.priceModifier,
                                          ),
                                        )}`}
                                </small>
                              </span>
                            </label>
                          );
                        },
                      )}
                    </div>
                  </fieldset>
                )}

              {/* ========================================
                  EXTRAS
              ======================================== */}

              {product.extraOptions &&
                product
                  .extraOptions
                  .length >
                  0 && (
                  <fieldset className="product-customization">
                    <legend className="product-customization__title">
                      Agregá extras
                    </legend>

                    <p className="product-customization__subtitle">
                      Podés elegir
                      más de uno.
                    </p>

                    <div className="product-customization__options product-customization__options--two-columns">
                      {product.extraOptions.map(
                        (
                          option,
                        ) => {
                          const isSelected =
                            selectedExtraIds.includes(
                              option.id,
                            );

                          return (
                            <label
                              className={`product-option ${
                                isSelected
                                  ? "product-option--selected"
                                  : ""
                              }`}
                              key={
                                option.id
                              }
                            >
                              <input
                                type="checkbox"
                                checked={
                                  isSelected
                                }
                                onChange={() =>
                                  handleExtraChange(
                                    option.id,
                                  )
                                }
                              />

                              <span className="product-option__information">
                                <strong>
                                  {
                                    option.name
                                  }
                                </strong>

                                <small>
                                  +{" "}
                                  {priceFormatter.format(
                                    option.priceModifier,
                                  )}
                                </small>
                              </span>
                            </label>
                          );
                        },
                      )}
                    </div>
                  </fieldset>
                )}

              {/* ========================================
                  QUITAR INGREDIENTES
              ======================================== */}

              {product.ingredients &&
                product
                  .ingredients
                  .length >
                  0 && (
                  <fieldset className="product-customization">
                    <legend className="product-customization__title">
                      ¿Querés sacar
                      algún ingrediente?
                    </legend>

                    <p className="product-customization__subtitle">
                      Marcá los
                      ingredientes que
                      no querés.
                    </p>

                    <div className="product-ingredients">
                      {product.ingredients.map(
                        (
                          ingredient,
                        ) => {
                          const isRemoved =
                            removedIngredients.includes(
                              ingredient,
                            );

                          return (
                            <label
                              className={`product-ingredient ${
                                isRemoved
                                  ? "product-ingredient--removed"
                                  : ""
                              }`}
                              key={
                                ingredient
                              }
                            >
                              <input
                                type="checkbox"
                                checked={
                                  isRemoved
                                }
                                onChange={() =>
                                  handleIngredientChange(
                                    ingredient,
                                  )
                                }
                              />

                              <span>
                                Sin{" "}
                                {
                                  ingredient
                                }
                              </span>
                            </label>
                          );
                        },
                      )}
                    </div>
                  </fieldset>
                )}

              {/* ========================================
                  ACLARACIÓN
              ======================================== */}

              <label
                className="product-notes"
                htmlFor="product-notes"
              >
                <span className="product-notes__title">
                  Aclaración para
                  este producto
                </span>

                <textarea
                  id="product-notes"
                  value={
                    notes
                  }
                  onChange={
                    handleNotesChange
                  }
                  placeholder="Ejemplo: cocinar bien la carne, salsa aparte..."
                  maxLength={
                    140
                  }
                  rows={3}
                />

                <small className="product-notes__counter">
                  {
                    notes.length
                  }
                  /140
                </small>
              </label>

              {/* ========================================
                  AGREGAR AL PEDIDO
              ======================================== */}

              {product.available !==
              false ? (
                <div
                  className="product-detail__add-wrapper"
                  onClick={
                    handleProductAdded
                  }
                >
                  <AddToCartButton
                    product={
                      product
                    }
                    customization={
                      customization
                    }
                    className="product-detail__add-button"
                    label={`Agregar por ${priceFormatter.format(
                      selectedPrice,
                    )}`}
                  />
                </div>
              ) : (
                <button
                  className="product-detail__add-button product-detail__add-button--disabled"
                  type="button"
                  disabled
                >
                  Producto sin stock
                </button>
              )}

              {/* ========================================
                  CONFIRMACIÓN
              ======================================== */}

              {showAddedActions ? (
                <div
                  className="product-added-actions"
                  role="status"
                  aria-live="polite"
                >
                  <div className="product-added-actions__message">
                    <span className="product-added-actions__icon">
                      <FaCircleCheck
                        aria-hidden="true"
                      />
                    </span>

                    <div className="product-added-actions__text">
                      <strong>
                        ¡Agregado a tu
                        pedido!
                      </strong>

                      <span>
                        {product.name}{" "}
                        ya está en tu
                        carrito.
                      </span>
                    </div>
                  </div>

                  <div className="product-added-actions__buttons">
                    <Link
                      className="product-added-actions__continue"
                      to="/menu"
                    >
                      <span>
                        Seguir viendo el
                        menú
                      </span>

                      <FaArrowRightLong
                        aria-hidden="true"
                      />
                    </Link>

                    <Link
                      className="product-added-actions__cart"
                      to="/carrito"
                    >
                      <FaBagShopping
                        aria-hidden="true"
                      />

                      <span>
                        Ver mi pedido
                      </span>
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="product-detail__notice">
                  Las opciones
                  seleccionadas aparecerán
                  como una línea
                  independiente dentro
                  de tu pedido.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ========================================
   CARGANDO
======================================== */

function ProductLoading() {
  return (
    <main className="product-detail">
      <section
        className="product-detail-empty"
        role="status"
        aria-live="polite"
      >
        <span
          className="product-detail-empty__icon"
          aria-hidden="true"
        >
          🍔
        </span>

        <h1 className="product-detail-empty__title">
          Cargando producto...
        </h1>

        <p className="product-detail-empty__description">
          Estamos preparando los
          detalles de tu Loongis.
        </p>
      </section>
    </main>
  );
}

/* ========================================
   ERROR
======================================== */

function ProductError({
  message,
}: {
  message: string;
}) {
  return (
    <main className="product-detail">
      <section
        className="product-detail-empty"
        role="alert"
      >
        <span
          className="product-detail-empty__icon"
          aria-hidden="true"
        >
          🍔
        </span>

        <h1 className="product-detail-empty__title">
          No pudimos cargar el
          producto
        </h1>

        <p className="product-detail-empty__description">
          {message}
        </p>

        <Link
          className="product-detail-empty__button"
          to="/menu"
        >
          Volver al menú
        </Link>
      </section>
    </main>
  );
}

/* ========================================
   PRODUCTO NO ENCONTRADO
======================================== */

function ProductNotFound() {
  return (
    <main className="product-detail">
      <section className="product-detail-empty">
        <span
          className="product-detail-empty__icon"
          aria-hidden="true"
        >
          🍔
        </span>

        <h1 className="product-detail-empty__title">
          Producto no encontrado
        </h1>

        <p className="product-detail-empty__description">
          El producto que
          intentaste abrir no
          existe o ya no está
          disponible.
        </p>

        <Link
          className="product-detail-empty__button"
          to="/menu"
        >
          Volver al menú
        </Link>
      </section>
    </main>
  );
}

/* ========================================
   PRODUCT DETAIL
======================================== */

export function ProductDetail() {
  const {
    productId,
  } = useParams();

  const numericProductId =
    Number(productId);

  const validProductId =
    Number.isInteger(
      numericProductId,
    ) &&
    numericProductId > 0
      ? numericProductId
      : null;

  const {
    product,
    loading,
    error,
    notFound,
  } = useProduct(
    validProductId,
  );

  if (loading) {
    return (
      <ProductLoading />
    );
  }

  if (error) {
    return (
      <ProductError
        message={error}
      />
    );
  }

  if (
    notFound ||
    !product
  ) {
    return (
      <ProductNotFound />
    );
  }

  return (
    <ProductDetailContent
      key={product.id}
      product={product}
    />
  );
}