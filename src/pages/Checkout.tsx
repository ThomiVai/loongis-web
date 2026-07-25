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

import { useCart } from "../hooks/useCart";

import "../styles/Checkout.css";

/*
  Reemplazá este número por el WhatsApp real del negocio.

  Formato para Argentina:
  54 + código de área sin 0 + número sin 15

  Ejemplo:
  5491123456789
*/
const WHATSAPP_NUMBER = "5491138065902";

const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

type DeliveryMethod = "delivery" | "retiro";
type PaymentMethod = "efectivo" | "transferencia";

type CheckoutForm = {
  customerName: string;
  customerPhone: string;
  deliveryMethod: DeliveryMethod;
  address: string;
  paymentMethod: PaymentMethod;
  notes: string;
};

const initialForm: CheckoutForm = {
  customerName: "",
  customerPhone: "",
  deliveryMethod: "delivery",
  address: "",
  paymentMethod: "efectivo",
  notes: "",
};

export function Checkout() {
  const { cart, totalUnits, totalPrice } = useCart();

  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setError(null);
  };

  const createWhatsAppMessage = () => {
    const productsMessage = cart
      .map((item) => {
        const subtotal = item.price * item.quantity;

        return [
          `• ${item.quantity} x ${item.name}`,
          `  ${priceFormatter.format(subtotal)}`,
        ].join("\n");
      })
      .join("\n");

    const deliveryMessage =
      form.deliveryMethod === "delivery"
        ? `Envío a domicilio\nDirección: ${form.address.trim()}`
        : "Retiro por el local";

    const paymentMessage =
      form.paymentMethod === "efectivo"
        ? "Efectivo"
        : "Transferencia";

    const notesMessage = form.notes.trim()
      ? form.notes.trim()
      : "Sin aclaraciones";

    return [
      "¡Hola Loongis! Quiero realizar el siguiente pedido:",
      "",
      "*PRODUCTOS*",
      productsMessage,
      "",
      "*RESUMEN*",
      `Unidades: ${totalUnits}`,
      `Subtotal: ${priceFormatter.format(totalPrice)}`,
      "Envío: A confirmar",
      `Total sin envío: ${priceFormatter.format(totalPrice)}`,
      "",
      "*DATOS DEL CLIENTE*",
      `Nombre: ${form.customerName.trim()}`,
      `Teléfono: ${form.customerPhone.trim() || "No informado"}`,
      "",
      "*ENTREGA*",
      deliveryMessage,
      "",
      "*FORMA DE PAGO*",
      paymentMessage,
      "",
      "*ACLARACIONES*",
      notesMessage,
    ].join("\n");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.customerName.trim()) {
      setError("Ingresá tu nombre para continuar.");
      return;
    }

    if (
      form.deliveryMethod === "delivery" &&
      !form.address.trim()
    ) {
      setError("Ingresá la dirección de entrega.");
      return;
    }

    if (cart.length === 0) {
      setError("Tu pedido está vacío.");
      return;
    }

    const message = createWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);

    const whatsappUrl =
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

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
              Primero agregá productos al pedido y después volvé para
              completar tus datos.
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
            Completá tus datos y te enviaremos a WhatsApp con el
            pedido preparado.
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
                    <strong aria-hidden="true">*</strong>
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
                    placeholder="Ejemplo: 11 3806-5902"
                    autoComplete="tel"
                  />
                </label>
              </div>

              <fieldset className="checkout-form__fieldset">
                <legend>Método de entrega</legend>

                <div className="checkout-form__options">
                  <label className="checkout-option">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="delivery"
                      checked={
                        form.deliveryMethod === "delivery"
                      }
                      onChange={handleChange}
                    />

                    <span className="checkout-option__content">
                      <strong>Envío a domicilio</strong>
                      <small>
                        El costo se confirma por WhatsApp.
                      </small>
                    </span>
                  </label>

                  <label className="checkout-option">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="retiro"
                      checked={
                        form.deliveryMethod === "retiro"
                      }
                      onChange={handleChange}
                    />

                    <span className="checkout-option__content">
                      <strong>Retiro por el local</strong>
                      <small>
                        Te avisaremos cuando esté preparado.
                      </small>
                    </span>
                  </label>
                </div>
              </fieldset>

              {form.deliveryMethod === "delivery" && (
                <label
                  className="checkout-form__field"
                  htmlFor="address"
                >
                  <span>
                    Dirección de entrega
                    <strong aria-hidden="true">*</strong>
                  </span>

                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Calle, altura y localidad"
                    autoComplete="street-address"
                  />
                </label>
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
                        form.paymentMethod === "efectivo"
                      }
                      onChange={handleChange}
                    />

                    <span className="checkout-option__content">
                      <strong>Efectivo</strong>
                      <small>
                        Se coordina al confirmar el pedido.
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
                      <strong>Transferencia</strong>
                      <small>
                        Te enviarán los datos por WhatsApp.
                      </small>
                    </span>
                  </label>
                </div>
              </fieldset>

              <label
                className="checkout-form__field"
                htmlFor="notes"
              >
                <span>Aclaraciones</span>

                <textarea
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Ejemplo: sin cebolla, tocar timbre, pagar con cambio..."
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

                <span>Confirmar por WhatsApp</span>
              </button>

              <p className="checkout-form__notice">
                El pedido se considera confirmado cuando el local
                responda el mensaje.
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
                {cart.map((item) => (
                  <div
                    className="checkout-summary__product"
                    key={item.id}
                  >
                    <div>
                      <strong>
                        {item.quantity} × {item.name}
                      </strong>

                      <span>
                        {priceFormatter.format(item.price)} c/u
                      </span>
                    </div>

                    <strong>
                      {priceFormatter.format(
                        item.price * item.quantity,
                      )}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="checkout-summary__row">
                <span>Unidades</span>
                <strong>{totalUnits}</strong>
              </div>

              <div className="checkout-summary__row">
                <span>Envío</span>
                <strong>A confirmar</strong>
              </div>

              <div className="checkout-summary__total">
                <span>Total sin envío</span>

                <strong>
                  {priceFormatter.format(totalPrice)}
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