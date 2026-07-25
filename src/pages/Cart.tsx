import {
  FaArrowLeftLong,
  FaBagShopping,
  FaMinus,
  FaPlus,
  FaTrashCan,
} from "react-icons/fa6";
import { Link } from "react-router-dom";

import { useCart } from "../hooks/useCart";

import "../styles/Cart.css";

const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

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

  const handleClearCart = () => {
    const shouldClearCart = window.confirm(
      "¿Seguro que querés vaciar todo el pedido?",
    );

    if (shouldClearCart) {
      clearCart();
    }
  };

  return (
    <main className="cart-page">
      <section className="cart-page__hero" aria-labelledby="cart-page-title">
        <div className="cart-page__container">
          <Link className="cart-page__back" to="/menu">
            <FaArrowLeftLong aria-hidden="true" />

            <span>Volver al menú</span>
          </Link>

          <div className="cart-page__heading">
            <span className="cart-page__eyebrow">Tu selección</span>

            <h1 className="cart-page__title" id="cart-page-title">
              Mi pedido
            </h1>

            <p className="cart-page__subtitle">
              Revisá tus productos, modificá las cantidades y prepará tu pedido.
            </p>
          </div>
        </div>
      </section>

      <section className="cart-content" aria-label="Contenido del pedido">
        <div className="cart-page__container">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty__icon">
                <FaBagShopping aria-hidden="true" />
              </div>

              <h2 className="cart-empty__title">Tu pedido está vacío</h2>

              <p className="cart-empty__description">
                Todavía no agregaste ninguna hamburguesa. Entrá al menú y elegí
                tu favorita.
              </p>

              <Link className="cart-empty__button" to="/menu">
                Ver el menú
              </Link>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-products">
                <div className="cart-products__header">
                  <div>
                    <span className="cart-products__label">Productos</span>

                    <h2 className="cart-products__title">Tu selección</h2>
                  </div>

                  <button
                    className="cart-products__clear"
                    type="button"
                    onClick={handleClearCart}
                  >
                    <FaTrashCan aria-hidden="true" />

                    <span>Vaciar pedido</span>
                  </button>
                </div>

                <div className="cart-products__list">
                  {cart.map((item) => {
                    const itemSubtotal = item.price * item.quantity;

                    return (
                      <article className="cart-item" key={item.id}>
                        <div className="cart-item__image-wrapper">
                          <img
                            className="cart-item__image"
                            src={item.image}
                            alt={item.imageAlt}
                          />
                        </div>

                        <div className="cart-item__information">
                          <h3 className="cart-item__name">{item.name}</h3>

                          <p className="cart-item__description">
                            {item.description}
                          </p>

                          <span className="cart-item__unit-price">
                            Precio unitario: {priceFormatter.format(item.price)}
                          </span>
                        </div>

                        <div className="cart-item__actions">
                          <div
                            className="cart-item__quantity"
                            aria-label={`Cantidad de ${item.name}`}
                          >
                            <button
                              className="cart-item__quantity-button"
                              type="button"
                              aria-label={`Disminuir cantidad de ${item.name}`}
                              onClick={() => decreaseQuantity(item.id)}
                            >
                              <FaMinus aria-hidden="true" />
                            </button>

                            <span className="cart-item__quantity-value">
                              {item.quantity}
                            </span>

                            <button
                              className="cart-item__quantity-button"
                              type="button"
                              aria-label={`Aumentar cantidad de ${item.name}`}
                              onClick={() => increaseQuantity(item.id)}
                            >
                              <FaPlus aria-hidden="true" />
                            </button>
                          </div>

                          <strong className="cart-item__subtotal">
                            {priceFormatter.format(itemSubtotal)}
                          </strong>

                          <button
                            className="cart-item__remove"
                            type="button"
                            aria-label={`Eliminar ${item.name} del pedido`}
                            onClick={() => removeProduct(item.id)}
                          >
                            <FaTrashCan aria-hidden="true" />

                            <span>Eliminar</span>
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              <aside
                className="cart-summary"
                aria-labelledby="cart-summary-title"
              >
                <span className="cart-summary__eyebrow">Resumen</span>

                <h2 className="cart-summary__title" id="cart-summary-title">
                  Resumen del pedido
                </h2>

                <div className="cart-summary__rows">
                  <div className="cart-summary__row">
                    <span>Productos distintos</span>

                    <strong>{cart.length}</strong>
                  </div>

                  <div className="cart-summary__row">
                    <span>Unidades totales</span>

                    <strong>{totalUnits}</strong>
                  </div>

                  <div className="cart-summary__row">
                    <span>Envío</span>

                    <strong>A confirmar</strong>
                  </div>
                </div>

                <div className="cart-summary__total">
                  <span>Total</span>

                  <strong>{priceFormatter.format(totalPrice)}</strong>
                </div>

                <p className="cart-summary__notice">
                  El costo del envío dependerá de la ubicación del cliente.
                </p>

                <Link className="cart-summary__checkout" to="/finalizar-pedido">
                  Finalizar pedido
                </Link>

                <Link className="cart-summary__continue" to="/menu">
                  Agregar más productos
                </Link>

                <p className="cart-summary__next-step">
                  En el próximo paso conectaremos la confirmación del pedido con
                  WhatsApp.
                </p>
              </aside>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
