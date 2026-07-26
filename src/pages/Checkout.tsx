import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { FaWhatsapp } from "react-icons/fa";
import {
  FaArrowLeftLong,
  FaBagShopping,
} from "react-icons/fa6";
import { Link } from "react-router-dom";

import type { CartItem } from "../context/CartContext";

import { deliveryZones } from "../data/deliveryZones";

import { useCart } from "../hooks/useCart";

import "../styles/Checkout.css";

/*
  Reemplazá este número por el WhatsApp real de Loongis.

  Formato:
  - Sin +
  - Sin espacios
  - Sin guiones
  - Código de país 54
  - 9 para celular argentino
*/
const WHATSAPP_NUMBER = "5491138065902";

const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

type DeliveryMethod = "delivery" | "retiro";

type PaymentMethod =
  | "efectivo"
  | "transferencia";

type CheckoutForm = {
  customerName: string;
  customerPhone: string;
  deliveryMethod: DeliveryMethod;
  deliveryZoneId: string;
  address: string;
  paymentMethod: PaymentMethod;
  notes: string;
};

const initialForm: CheckoutForm = {
  customerName: "",
  customerPhone: "",
  deliveryMethod: "delivery",
  deliveryZoneId: "",
  address: "",
  paymentMethod: "efectivo",
  notes: "",
};

function getCustomizationLines(
  item: CartItem,
): string[] {
  const lines: string[] = [];

  if (item.customization.size) {
    lines.push(
      `Tamaño: ${item.customization.size.name}`,
    );
  }

  if (
    item.customization.extras &&
    item.customization.extras.length > 0
  ) {
    lines.push(
      `Extras: ${item.customization.extras
        .map((extra) => extra.name)
        .join(", ")}`,
    );
  }

  if (
    item.customization.removedIngredients &&
    item.customization.removedIngredients.length > 0
  ) {
    lines.push(
      `Sin: ${item.customization.removedIngredients.join(
        ", ",
      )}`,
    );
  }

  if (item.customization.notes?.trim()) {
    lines.push(
      `Aclaración: ${item.customization.notes.trim()}`,
    );
  }

  return lines;
}

export function Checkout() {
  const {
    cart,
    totalUnits,
    totalPrice,
  } = useCart();

  const [form, setForm] =
    useState<CheckoutForm>(initialForm);

  const [error, setError] =
    useState<string | null>(null);

  const selectedDeliveryZone =
    deliveryZones.find(
      (zone) =>
        zone.id === form.deliveryZoneId,
    );

  const shippingCost =
    form.deliveryMethod === "retiro"
      ? 0
      : selectedDeliveryZone?.price ?? 0;

  const finalTotal =
    totalPrice + shippingCost;

  const handleChange = (
    event: ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;

    setForm(
      (currentForm) =>
        ({
          ...currentForm,
          [name]: value,
        }) as CheckoutForm,
    );

    setError(null);
  };

  const createWhatsAppMessage = () => {
    const productsMessage = cart
      .map((item) => {
        const subtotal =
          item.unitPrice * item.quantity;

        const customizationLines =
          getCustomizationLines(item);

        const productLines = [
          `• ${item.quantity} x ${item.name}`,
        ];

        if (customizationLines.length > 0) {
          productLines.push(
            ...customizationLines.map(
              (line) => `  - ${line}`,
            ),
          );
        }

        productLines.push(
          `  Precio unitario: ${priceFormatter.format(
            item.unitPrice,
          )}`,
          `  Subtotal: ${priceFormatter.format(
            subtotal,
          )}`,
        );

        return productLines.join("\n");
      })
      .join("\n\n");

    const deliveryMessage =
      form.deliveryMethod === "delivery"
        ? [
            "Envío a domicilio",
            `Localidad: ${selectedDeliveryZone?.name}`,
            `Dirección: ${form.address.trim()}`,
            `Costo de envío: ${priceFormatter.format(
              shippingCost,
            )}`,
            `Tiempo estimado: ${selectedDeliveryZone?.estimatedTime}`,
          ].join("\n")
        : [
            "Retiro por el local",
            "Costo de retiro: Gratis",
          ].join("\n");

    const paymentMessage =
      form.paymentMethod === "efectivo"
        ? "Efectivo"
        : "Transferencia";

    const customerNotes = form.notes.trim()
      ? form.notes.trim()
      : "Sin aclaraciones generales";

    return [
      "¡Hola Loongis! Quiero realizar el siguiente pedido:",
      "",
      "*PRODUCTOS*",
      productsMessage,
      "",
      "*RESUMEN*",
      `Productos distintos: ${cart.length}`,
      `Unidades totales: ${totalUnits}`,
      `Subtotal: ${priceFormatter.format(
        totalPrice,
      )}`,
      `Envío: ${
        form.deliveryMethod === "retiro"
          ? "Gratis"
          : priceFormatter.format(
              shippingCost,
            )
      }`,
      `TOTAL FINAL: ${priceFormatter.format(
        finalTotal,
      )}`,
      "",
      "*DATOS DEL CLIENTE*",
      `Nombre: ${form.customerName.trim()}`,
      `Teléfono: ${
        form.customerPhone.trim() ||
        "No informado"
      }`,
      "",
      "*ENTREGA*",
      deliveryMessage,
      "",
      "*FORMA DE PAGO*",
      paymentMessage,
      "",
      "*ACLARACIONES GENERALES*",
      customerNotes,
    ].join("\n");
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!form.customerName.trim()) {
      setError(
        "Ingresá tu nombre para continuar.",
      );

      return;
    }

    if (
      form.deliveryMethod === "delivery" &&
      !form.deliveryZoneId
    ) {
      setError(
        "Seleccioná la localidad de entrega.",
      );

      return;
    }

    if (
      form.deliveryMethod === "delivery" &&
      !form.address.trim()
    ) {
      setError(
        "Ingresá la dirección de entrega.",
      );

      return;
    }

    if (cart.length === 0) {
      setError("Tu pedido está vacío.");

      return;
    }

    const message =
      createWhatsAppMessage();

    const encodedMessage =
      encodeURIComponent(message);

    const whatsappUrl =
      `https://wa.me/${WHATSAPP_NUMBER}` +
      `?text=${encodedMessage}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer",
    );
  };

  if (cart.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <div className="checkout-empty__content">
            <div className="checkout-empty__icon">
              <FaBagShopping aria-hidden="true" />
            </div>

            <h1 className="checkout-empty__title">
              No hay productos para confirmar
            </h1>

            <p className="checkout-empty__description">
              Primero agregá productos al pedido y
              después volvé para completar tus datos.
            </p>

            <Link
              className="checkout-empty__button"
              to="/menu"
            >
              Ver el menú
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <section
        className="checkout-page__hero"
        aria-labelledby="checkout-page-title"
      >
        <div className="checkout-page__container">
          <Link
            className="checkout-page__back"
            to="/carrito"
          >
            <FaArrowLeftLong aria-hidden="true" />

            <span>Volver a mi pedido</span>
          </Link>

          <span className="checkout-page__eyebrow">
            Último paso
          </span>

          <h1
            className="checkout-page__title"
            id="checkout-page-title"
          >
            Finalizar pedido
          </h1>

          <p className="checkout-page__subtitle">
            Completá tus datos, seleccioná la
            localidad y conocé el total final.
          </p>
        </div>
      </section>

      <section className="checkout-content">
        <div className="checkout-page__container">
          <div className="checkout-layout">
            <form
              className="checkout-form"
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="checkout-form__header">
                <span className="checkout-form__label">
                  Datos del cliente
                </span>

                <h2 className="checkout-form__title">
                  Información del pedido
                </h2>
              </div>

              <div className="checkout-form__group">
                <label
                  className="checkout-form__field"
                  htmlFor="customerName"
                >
                  <span>
                    Nombre y apellido

                    <strong aria-hidden="true">
                      *
                    </strong>
                  </span>

                  <input
                    id="customerName"
                    name="customerName"
                    type="text"
                    value={form.customerName}
                    onChange={handleChange}
                    placeholder="Ejemplo: Thomas Vai"
                    autoComplete="name"
                  />
                </label>

                <label
                  className="checkout-form__field"
                  htmlFor="customerPhone"
                >
                  <span>Teléfono</span>

                  <input
                    id="customerPhone"
                    name="customerPhone"
                    type="tel"
                    value={form.customerPhone}
                    onChange={handleChange}
                    placeholder="Ejemplo: 11 2345-6789"
                    autoComplete="tel"
                  />
                </label>
              </div>

              <fieldset className="checkout-form__fieldset">
                <legend>
                  Método de entrega
                </legend>

                <div className="checkout-form__options">
                  <label className="checkout-option">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="delivery"
                      checked={
                        form.deliveryMethod ===
                        "delivery"
                      }
                      onChange={handleChange}
                    />

                    <span className="checkout-option__content">
                      <strong>
                        Envío a domicilio
                      </strong>

                      <small>
                        El costo depende de la
                        localidad.
                      </small>
                    </span>
                  </label>

                  <label className="checkout-option">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="retiro"
                      checked={
                        form.deliveryMethod ===
                        "retiro"
                      }
                      onChange={handleChange}
                    />

                    <span className="checkout-option__content">
                      <strong>
                        Retiro por el local
                      </strong>

                      <small>
                        Sin costo de envío.
                      </small>
                    </span>
                  </label>
                </div>
              </fieldset>

              {form.deliveryMethod ===
                "delivery" && (
                <>
                  <div className="checkout-form__group">
                    <label
                      className="checkout-form__field"
                      htmlFor="deliveryZoneId"
                    >
                      <span>
                        Localidad

                        <strong aria-hidden="true">
                          *
                        </strong>
                      </span>

                      <select
                        id="deliveryZoneId"
                        name="deliveryZoneId"
                        value={
                          form.deliveryZoneId
                        }
                        onChange={handleChange}
                      >
                        <option value="">
                          Seleccioná una localidad
                        </option>

                        {deliveryZones.map(
                          (zone) => (
                            <option
                              value={zone.id}
                              key={zone.id}
                            >
                              {zone.name} —{" "}
                              {priceFormatter.format(
                                zone.price,
                              )}
                            </option>
                          ),
                        )}
                      </select>
                    </label>

                    <label
                      className="checkout-form__field"
                      htmlFor="address"
                    >
                      <span>
                        Dirección

                        <strong aria-hidden="true">
                          *
                        </strong>
                      </span>

                      <input
                        id="address"
                        name="address"
                        type="text"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Calle y altura"
                        autoComplete="street-address"
                      />
                    </label>
                  </div>

                  {selectedDeliveryZone && (
                    <div className="checkout-delivery-info">
                      <div>
                        <span>
                          Costo de envío
                        </span>

                        <strong>
                          {priceFormatter.format(
                            selectedDeliveryZone.price,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Tiempo estimado
                        </span>

                        <strong>
                          {
                            selectedDeliveryZone.estimatedTime
                          }
                        </strong>
                      </div>
                    </div>
                  )}
                </>
              )}

              {form.deliveryMethod ===
                "retiro" && (
                <div className="checkout-delivery-info checkout-delivery-info--pickup">
                  <div>
                    <span>
                      Retiro por el local
                    </span>

                    <strong>Sin costo</strong>
                  </div>

                  <p>
                    Te avisaremos por WhatsApp cuando
                    el pedido esté listo.
                  </p>
                </div>
              )}

              <fieldset className="checkout-form__fieldset">
                <legend>Forma de pago</legend>

                <div className="checkout-form__options">
                  <label className="checkout-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="efectivo"
                      checked={
                        form.paymentMethod ===
                        "efectivo"
                      }
                      onChange={handleChange}
                    />

                    <span className="checkout-option__content">
                      <strong>Efectivo</strong>

                      <small>
                        Se coordina al confirmar el
                        pedido.
                      </small>
                    </span>
                  </label>

                  <label className="checkout-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="transferencia"
                      checked={
                        form.paymentMethod ===
                        "transferencia"
                      }
                      onChange={handleChange}
                    />

                    <span className="checkout-option__content">
                      <strong>
                        Transferencia
                      </strong>

                      <small>
                        Te enviarán los datos por
                        WhatsApp.
                      </small>
                    </span>
                  </label>
                </div>
              </fieldset>

              <label
                className="checkout-form__field"
                htmlFor="notes"
              >
                <span>
                  Aclaraciones generales
                </span>

                <textarea
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Ejemplo: tocar timbre, necesito cambio..."
                  rows={4}
                />
              </label>

              {error && (
                <div
                  className="checkout-form__error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <button
                className="checkout-form__submit"
                type="submit"
              >
                <FaWhatsapp aria-hidden="true" />

                <span>
                  Confirmar por WhatsApp
                </span>
              </button>

              <p className="checkout-form__notice">
                El pedido se considera confirmado
                cuando el local responda el mensaje.
              </p>
            </form>

            <aside
              className="checkout-summary"
              aria-labelledby="checkout-summary-title"
            >
              <span className="checkout-summary__eyebrow">
                Tu pedido
              </span>

              <h2
                className="checkout-summary__title"
                id="checkout-summary-title"
              >
                Resumen
              </h2>

              <div className="checkout-summary__products">
                {cart.map((item) => {
                  const customizationLines =
                    getCustomizationLines(item);

                  return (
                    <div
                      className="checkout-summary__product"
                      key={item.cartItemId}
                    >
                      <div>
                        <strong>
                          {item.quantity} ×{" "}
                          {item.name}
                        </strong>

                        {customizationLines.map(
                          (line) => (
                            <span
                              key={`${item.cartItemId}-${line}`}
                            >
                              {line}
                            </span>
                          ),
                        )}

                        <span>
                          {priceFormatter.format(
                            item.unitPrice,
                          )}{" "}
                          c/u
                        </span>
                      </div>

                      <strong>
                        {priceFormatter.format(
                          item.unitPrice *
                            item.quantity,
                        )}
                      </strong>
                    </div>
                  );
                })}
              </div>

              <div className="checkout-summary__row">
                <span>Subtotal</span>

                <strong>
                  {priceFormatter.format(
                    totalPrice,
                  )}
                </strong>
              </div>

              <div className="checkout-summary__row">
                <span>Envío</span>

                <strong>
                  {form.deliveryMethod ===
                  "retiro"
                    ? "Gratis"
                    : selectedDeliveryZone
                      ? priceFormatter.format(
                          shippingCost,
                        )
                      : "Seleccioná zona"}
                </strong>
              </div>

              <div className="checkout-summary__total">
                <span>Total final</span>

                <strong>
                  {priceFormatter.format(
                    finalTotal,
                  )}
                </strong>
              </div>

              <Link
                className="checkout-summary__edit"
                to="/carrito"
              >
                Editar mi pedido
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}