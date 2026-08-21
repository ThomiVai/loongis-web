import { useState } from "react";
import {
  FaArrowLeftLong,
  FaBagShopping,
  FaMinus,
  FaPlus,
  FaTrashCan,
} from "react-icons/fa6";
import { Link } from "react-router-dom";

import { ConfirmModal } from "../components/ConfirmModal";

import type { CartItem } from "../context/CartContext";

import { useCart } from "../hooks/useCart";
import { useNotification } from "../hooks/useNotification";

import "../styles/Cart.css";
import "../styles/CartCustomization.css";

const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

type CustomizationDetail = {
  label: string;
  value: string;
  type?: "normal" | "removed" | "notes";
};

function getCustomizationDetails(
  item: CartItem,
): CustomizationDetail[] {
  const details: CustomizationDetail[] = [];

  if (item.customization.size) {
    details.push({
      label: "Tamaño",
      value: item.customization.size.name,
    });
  }

  if (
    item.customization.extras &&
    item.customization.extras.length > 0
  ) {
    details.push({
      label: "Extras",
      value: item.customization.extras
        .map((extra) => extra.name)
        .join(", "),
    });
  }

  if (
    item.customization.removedIngredients &&
    item.customization.removedIngredients.length > 0
  ) {
    details.push({
      label: "Sin",
      value:
        item.customization.removedIngredients.join(", "),
      type: "removed",
    });
  }

  if (item.customization.notes?.trim()) {
    details.push({
      label: "Aclaración",
      value: item.customization.notes.trim(),
      type: "notes",
    });
  }

  return details;
}

export function Cart() {
  const {
    cart,
    totalUnits,
    totalPrice,
    increaseQuantity,
    decreaseQuantity,
    removeProduct,
    clearCart,
  } = useCart();

  const { showNotification } =
    useNotification();

  const [
    isClearModalOpen,
    setIsClearModalOpen,
  ] = useState(false);

  const handleConfirmClearCart = () => {
    clearCart();

    setIsClearModalOpen(false);

    showNotification(
      "El pedido fue vaciado.",
      "info",
    );
  };

  const handleRemoveProduct = (
    item: CartItem,
  ) => {
    removeProduct(item.cartItemId);

    showNotification(
      `${item.name} fue eliminado del pedido.`,
      "info",
    );
  };

  return (
    <main className="cart-page">
      {/* ========================================
          HERO
      ======================================== */}

      <section
        className="cart-page__hero"
        aria-labelledby="cart-page-title"
      >
        <div className="cart-page__container">
          <Link
            className="cart-page__back"
            to="/menu"
          >
            <FaArrowLeftLong
              aria-hidden="true"
            />

            <span>Volver al menú</span>
          </Link>

          <div className="cart-page__hero-layout">
            {/* ========================================
                TEXTO
            ======================================== */}

            <div className="cart-page__heading">
              <span className="cart-page__eyebrow">
                Tu selección
              </span>

              <h1
                className="cart-page__title"
                id="cart-page-title"
              >
                Mi pedido
              </h1>

              <p className="cart-page__subtitle">
                Revisá los productos, sus
                personalizaciones y las cantidades
                antes de finalizar.
              </p>
            </div>

            {/* ========================================
                MASCOTA + BURGER
            ======================================== */}

            <div
              className="cart-page__visual"
              aria-hidden="true"
            >
              <img
                className="cart-page__visual-image"
                src="/images/hero/cart-loongis.png"
                alt=""
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          CONTENIDO
      ======================================== */}

      <section
        className="cart-content"
        aria-label="Contenido del pedido"
      >
        <div className="cart-page__container">
          {cart.length === 0 ? (
            /* ========================================
               CARRITO VACÍO
            ======================================== */

            <div className="cart-empty">
              <div className="cart-empty__icon">
                <FaBagShopping
                  aria-hidden="true"
                />
              </div>

              <h2 className="cart-empty__title">
                Tu pedido está vacío
              </h2>

              <p className="cart-empty__description">
                Todavía no agregaste ningún producto.
                Entrá al menú y elegí tu favorito.
              </p>

              <Link
                className="cart-empty__button"
                to="/menu"
              >
                Ver el menú
              </Link>
            </div>
          ) : (
            /* ========================================
               CARRITO CON PRODUCTOS
            ======================================== */

            <div className="cart-layout">
              <div className="cart-products">
                {/* ========================================
                    ENCABEZADO PRODUCTOS
                ======================================== */}

                <div className="cart-products__header">
                  <div>
                    <span className="cart-products__label">
                      Productos
                    </span>

                    <h2 className="cart-products__title">
                      Tu selección
                    </h2>
                  </div>

                  <button
                    className="cart-products__clear"
                    type="button"
                    onClick={() =>
                      setIsClearModalOpen(true)
                    }
                  >
                    <FaTrashCan
                      aria-hidden="true"
                    />

                    <span>Vaciar pedido</span>
                  </button>
                </div>

                {/* ========================================
                    LISTA
                ======================================== */}

                <div className="cart-products__list">
                  {cart.map((item) => {
                    const itemSubtotal =
                      item.unitPrice *
                      item.quantity;

                    const customizationDetails =
                      getCustomizationDetails(
                        item,
                      );

                    const isCustomized =
                      customizationDetails.length >
                      0;

                    return (
                      <article
                        className={[
                          "cart-item",
                          `cart-item--${item.id}`,
                        ].join(" ")}
                        key={item.cartItemId}
                      >
                        {/* ========================================
                            IMAGEN
                        ======================================== */}

                        <div className="cart-item__image-wrapper">
                          <img
                            className="cart-item__image"
                            src={item.image}
                            alt={item.imageAlt}
                          />
                        </div>

                        {/* ========================================
                            INFORMACIÓN
                        ======================================== */}

                        <div className="cart-item__information">
                          <div className="cart-item__heading">
                            <h3 className="cart-item__name">
                              {item.name}
                            </h3>

                            {isCustomized && (
                              <span className="cart-item__personalized-badge">
                                Personalizado
                              </span>
                            )}
                          </div>

                          <p className="cart-item__description">
                            {item.description}
                          </p>

                          {/* ========================================
                              PERSONALIZACIÓN
                          ======================================== */}

                          {isCustomized && (
                            <div className="cart-item-customization">
                              {customizationDetails.map(
                                (detail) => (
                                  <div
                                    className={`cart-item-customization__detail cart-item-customization__detail--${
                                      detail.type ??
                                      "normal"
                                    }`}
                                    key={`${item.cartItemId}-${detail.label}`}
                                  >
                                    <span className="cart-item-customization__label">
                                      {detail.label}
                                    </span>

                                    <span className="cart-item-customization__value">
                                      {detail.value}
                                    </span>
                                  </div>
                                ),
                              )}
                            </div>
                          )}

                          {/* ========================================
                              PRECIO UNITARIO
                          ======================================== */}

                          <div className="cart-item__price-information">
                            <span className="cart-item__unit-price">
                              Precio unitario:{" "}
                              {priceFormatter.format(
                                item.unitPrice,
                              )}
                            </span>

                            <Link
                              className="cart-item__customize-again"
                              to={`/producto/${item.id}`}
                            >
                              {isCustomized
                                ? "Personalizar otra"
                                : "Ver producto"}
                            </Link>
                          </div>
                        </div>

                        {/* ========================================
                            ACCIONES
                        ======================================== */}

                        <div className="cart-item__actions">
                          <div
                            className="cart-item__quantity"
                            aria-label={`Cantidad de ${item.name}`}
                          >
                            <button
                              className="cart-item__quantity-button"
                              type="button"
                              aria-label={`Disminuir cantidad de ${item.name}`}
                              onClick={() =>
                                decreaseQuantity(
                                  item.cartItemId,
                                )
                              }
                            >
                              <FaMinus
                                aria-hidden="true"
                              />
                            </button>

                            <span className="cart-item__quantity-value">
                              {item.quantity}
                            </span>

                            <button
                              className="cart-item__quantity-button"
                              type="button"
                              aria-label={`Aumentar cantidad de ${item.name}`}
                              onClick={() =>
                                increaseQuantity(
                                  item.cartItemId,
                                )
                              }
                            >
                              <FaPlus
                                aria-hidden="true"
                              />
                            </button>
                          </div>

                          <strong className="cart-item__subtotal">
                            {priceFormatter.format(
                              itemSubtotal,
                            )}
                          </strong>

                          <button
                            className="cart-item__remove"
                            type="button"
                            aria-label={`Eliminar ${item.name} del pedido`}
                            onClick={() =>
                              handleRemoveProduct(
                                item,
                              )
                            }
                          >
                            <FaTrashCan
                              aria-hidden="true"
                            />

                            <span>Eliminar</span>
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              {/* ========================================
                  RESUMEN
              ======================================== */}

              <aside
                className="cart-summary"
                aria-labelledby="cart-summary-title"
              >
                <span className="cart-summary__eyebrow">
                  Resumen
                </span>

                <h2
                  className="cart-summary__title"
                  id="cart-summary-title"
                >
                  Resumen del pedido
                </h2>

                <div className="cart-summary__rows">
                  {/* 
                    Quitamos "Configuraciones distintas".

                    Para el cliente interesa cuánto
                    está pidiendo, no cuántas
                    configuraciones internas existen.
                  */}

                  <div className="cart-summary__row">
                    <span>Unidades totales</span>

                    <strong>
                      {totalUnits}
                    </strong>
                  </div>

                  <div className="cart-summary__row">
                    <span>Envío</span>

                    <strong>
                      Se calcula al finalizar
                    </strong>
                  </div>
                </div>

                <div className="cart-summary__total">
                  <span>Total</span>

                  <strong>
                    {priceFormatter.format(
                      totalPrice,
                    )}
                  </strong>
                </div>

                <p className="cart-summary__notice">
                  Seleccioná tu localidad al finalizar
                  para conocer el total con envío.
                </p>

                <Link
                  className="cart-summary__checkout"
                  to="/finalizar-pedido"
                >
                  Finalizar pedido
                </Link>

                <Link
                  className="cart-summary__continue"
                  to="/menu"
                >
                  Agregar más productos
                </Link>
              </aside>
            </div>
          )}
        </div>
      </section>

      {/* ========================================
          MODAL VACIAR
      ======================================== */}

      <ConfirmModal
        isOpen={isClearModalOpen}
        title="¿Vaciar todo el pedido?"
        message="Se eliminarán todos los productos y personalizaciones que agregaste."
        confirmLabel="Sí, vaciar"
        cancelLabel="Cancelar"
        danger
        onConfirm={
          handleConfirmClearCart
        }
        onCancel={() =>
          setIsClearModalOpen(false)
        }
      />
    </main>
  );
}