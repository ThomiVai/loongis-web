import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  FaArrowLeftLong,
  FaBuildingColumns,
  FaLocationDot,
  FaMoneyBillWave,
  FaStore,
  FaTruck,
  FaWhatsapp,
} from "react-icons/fa6";
import { Link } from "react-router-dom";

import { useCart } from "../hooks/useCart";

import "../styles/Checkout.css";

/* ========================================
   WHATSAPP
======================================== */

/*
  Reemplazá este número por el WhatsApp real
  de Loongis.

  Formato:
  - Código de país: 54
  - 9 para celulares argentinos
  - Código de área
  - Número

  No uses +, espacios ni guiones.
*/

const WHATSAPP_NUMBER =
  "5491138065902";

/* ========================================
   TIPOS
======================================== */

type DeliveryMethod =
  | "delivery"
  | "pickup";

type PaymentMethod =
  | "cash"
  | "transfer";

type CheckoutForm = {
  customerName: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
  address: string;
  paymentMethod: PaymentMethod;
  notes: string;
};

type CheckoutOption = {
  name?: string;
  label?: string;
  price?: number;
  priceModifier?: number;
};

type CheckoutCustomization = {
  size?: CheckoutOption;
  variant?: CheckoutOption;
  extras?: CheckoutOption[];
  removedIngredients?: string[];
  notes?: string;
};

type CheckoutCartItem = {
  id: number | string;

  cartItemId?: string;

  name: string;
  description?: string;

  image?: string;
  imageAlt?: string;

  price: number;
  unitPrice?: number;

  quantity: number;

  customization?: CheckoutCustomization;

  selectedSize?: CheckoutOption;
  selectedExtras?: CheckoutOption[];

  removedIngredients?: string[];

  notes?: string;
};

/* ========================================
   FORMATO DE PRECIO
======================================== */

const priceFormatter =
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

/* ========================================
   FUNCIONES AUXILIARES
======================================== */

function getOptionName(
  option?: CheckoutOption,
): string {
  return (
    option?.name?.trim() ||
    option?.label?.trim() ||
    ""
  );
}

function getUnitPrice(
  item: CheckoutCartItem,
): number {
  return (
    item.unitPrice ??
    item.price
  );
}

function getItemCustomization(
  item: CheckoutCartItem,
) {
  const customization =
    item.customization;

  const size =
    customization?.size ??
    customization?.variant ??
    item.selectedSize;

  const extras =
    customization?.extras ??
    item.selectedExtras ??
    [];

  const removedIngredients =
    customization?.removedIngredients ??
    item.removedIngredients ??
    [];

  const notes =
    customization?.notes?.trim() ||
    item.notes?.trim() ||
    "";

  return {
    size,
    extras,
    removedIngredients,
    notes,
  };
}

/* ========================================
   TEXTO DE PRODUCTO PARA WHATSAPP
======================================== */

function createProductMessage(
  item: CheckoutCartItem,
): string {
  const unitPrice =
    getUnitPrice(item);

  const subtotal =
    unitPrice *
    item.quantity;

  const {
    size,
    extras,
    removedIngredients,
    notes,
  } = getItemCustomization(item);

  const lines: string[] = [
    `• ${item.quantity}x ${item.name}`,
    `  ${priceFormatter.format(subtotal)}`,
  ];

  const sizeName =
    getOptionName(size);

  if (sizeName) {
    lines.push(
      `  Tamaño: ${sizeName}`,
    );
  }

  if (extras.length > 0) {
    const extrasNames =
      extras
        .map(getOptionName)
        .filter(Boolean)
        .join(", ");

    if (extrasNames) {
      lines.push(
        `  Extras: ${extrasNames}`,
      );
    }
  }

  if (
    removedIngredients.length > 0
  ) {
    lines.push(
      `  Sin: ${removedIngredients.join(
        ", ",
      )}`,
    );
  }

  if (notes) {
    lines.push(
      `  Aclaración: ${notes}`,
    );
  }

  return lines.join("\n");
}

/* ========================================
   COMPONENTE
======================================== */

export function Checkout() {
  const { cart } =
    useCart();

  const checkoutItems =
    cart as CheckoutCartItem[];

  const [
    form,
    setForm,
  ] = useState<CheckoutForm>({
    customerName: "",
    phone: "",

    deliveryMethod:
      "delivery",

    address: "",

    paymentMethod:
      "cash",

    notes: "",
  });

  /* ========================================
     TOTALES
  ======================================== */

  const totalPrice =
    checkoutItems.reduce(
      (total, item) =>
        total +
        getUnitPrice(item) *
          item.quantity,
      0,
    );

  const totalUnits =
    checkoutItems.reduce(
      (total, item) =>
        total +
        item.quantity,
      0,
    );

  /* ========================================
     INPUTS
  ======================================== */

  const handleInputChange = (
    event: ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement
    >,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (currentForm) => ({
        ...currentForm,

        [name]: value,
      }),
    );
  };

  /* ========================================
     ENTREGA
  ======================================== */

  const selectDeliveryMethod = (
    method: DeliveryMethod,
  ) => {
    setForm(
      (currentForm) => ({
        ...currentForm,

        deliveryMethod:
          method,

        /*
          Si elegimos retiro,
          limpiamos la dirección.
        */

        address:
          method === "pickup"
            ? ""
            : currentForm.address,
      }),
    );
  };

  /* ========================================
     PAGO
  ======================================== */

  const selectPaymentMethod = (
    method: PaymentMethod,
  ) => {
    setForm(
      (currentForm) => ({
        ...currentForm,

        paymentMethod:
          method,
      }),
    );
  };

  /* ========================================
     FINALIZAR
  ======================================== */

  const handleSubmit = (
    event:
      FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const customerName =
      form.customerName.trim();

    const phone =
      form.phone.trim();

    const address =
      form.address.trim();

    const notes =
      form.notes.trim();

    if (
      !customerName ||
      !phone
    ) {
      return;
    }

    if (
      form.deliveryMethod ===
        "delivery" &&
      !address
    ) {
      return;
    }

    if (
      checkoutItems.length === 0
    ) {
      return;
    }

    const deliveryText =
      form.deliveryMethod ===
      "delivery"
        ? "Envío a domicilio"
        : "Retiro por el local";

    const paymentText =
      form.paymentMethod ===
      "cash"
        ? "Efectivo"
        : "Transferencia";

    const productsText =
      checkoutItems
        .map(
          createProductMessage,
        )
        .join("\n\n");

    const messageLines = [
      "🍔 *NUEVO PEDIDO LOONGIS*",
      "",
      `👤 *Cliente:* ${customerName}`,
      `📱 *Teléfono:* ${phone}`,
      `📦 *Entrega:* ${deliveryText}`,
    ];

    if (
      form.deliveryMethod ===
      "delivery"
    ) {
      messageLines.push(
        `📍 *Dirección:* ${address}`,
      );
    }

    messageLines.push(
      `💳 *Pago:* ${paymentText}`,
      "",
      "🧾 *PEDIDO*",
      productsText,
      "",
      `🔢 *Unidades:* ${totalUnits}`,
      `💰 *TOTAL:* ${priceFormatter.format(
        totalPrice,
      )}`,
    );

    if (notes) {
      messageLines.push(
        "",
        `📝 *Aclaraciones generales:* ${notes}`,
      );
    }

    const message =
      messageLines.join("\n");

    const whatsappUrl =
      `https://wa.me/${WHATSAPP_NUMBER}` +
      `?text=${encodeURIComponent(
        message,
      )}`;

    window.location.assign(
      whatsappUrl,
    );
  };

  /* ========================================
     CARRITO VACÍO
  ======================================== */

  if (
    checkoutItems.length === 0
  ) {
    return (
      <main className="checkout-page">
        <div className="checkout-page__container">
          <section className="checkout-empty">
            <span className="checkout-empty__eyebrow">
              Tu pedido
            </span>

            <h1 className="checkout-empty__title">
              El carrito está vacío
            </h1>

            <p className="checkout-empty__description">
              Agregá algún producto
              antes de finalizar el
              pedido.
            </p>

            <Link
              className="checkout-empty__button"
              to="/menu"
            >
              Ver menú
            </Link>
          </section>
        </div>
      </main>
    );
  }

  /* ========================================
     CHECKOUT
  ======================================== */

  return (
    <main className="checkout-page">
      <div className="checkout-page__container">
        {/* ========================================
            VOLVER
        ======================================== */}

        <Link
          className="checkout-page__back"
          to="/carrito"
        >
          <FaArrowLeftLong
            aria-hidden="true"
          />

          <span>
            Volver al carrito
          </span>
        </Link>

        {/* ========================================
            ENCABEZADO
        ======================================== */}

        <header className="checkout-page__header">
          <span className="checkout-page__eyebrow">
            Último paso
          </span>

          <h1 className="checkout-page__title">
            Finalizá tu pedido
          </h1>

          <p className="checkout-page__description">
            Completá tus datos y te
            llevamos directamente a
            WhatsApp con el pedido
            escrito.
          </p>
        </header>

        {/* ========================================
            LAYOUT
        ======================================== */}

        <div className="checkout-layout">
          {/* ========================================
              FORMULARIO
          ======================================== */}

          <form
            className="checkout-form"
            onSubmit={
              handleSubmit
            }
          >
            {/* ========================================
                DATOS
            ======================================== */}

            <section className="checkout-section">
              <h2 className="checkout-section__title">
                Tus datos
              </h2>

              <div className="checkout-form__grid">
                <label className="checkout-field">
                  <span>
                    Nombre completo
                  </span>

                  <input
                    type="text"
                    name="customerName"
                    value={
                      form.customerName
                    }
                    placeholder="Ej: Tomás Vai"
                    autoComplete="name"
                    minLength={2}
                    required
                    onChange={
                      handleInputChange
                    }
                  />
                </label>

                <label className="checkout-field">
                  <span>
                    Teléfono
                  </span>

                  <input
                    type="tel"
                    name="phone"
                    value={
                      form.phone
                    }
                    placeholder="Ej: 11 2345 6789"
                    autoComplete="tel"
                    minLength={6}
                    required
                    onChange={
                      handleInputChange
                    }
                  />
                </label>
              </div>
            </section>

            {/* ========================================
                ENTREGA
            ======================================== */}

            <section className="checkout-section">
              <h2 className="checkout-section__title">
                Forma de entrega
              </h2>

              <div className="checkout-options">
                <button
                  className={`checkout-option ${
                    form.deliveryMethod ===
                    "delivery"
                      ? "checkout-option--active"
                      : ""
                  }`}
                  type="button"
                  aria-pressed={
                    form.deliveryMethod ===
                    "delivery"
                  }
                  onClick={() =>
                    selectDeliveryMethod(
                      "delivery",
                    )
                  }
                >
                  <FaTruck
                    aria-hidden="true"
                  />

                  <span>
                    <strong>
                      Envío
                    </strong>

                    <small>
                      Recibilo en tu casa
                    </small>
                  </span>
                </button>

                <button
                  className={`checkout-option ${
                    form.deliveryMethod ===
                    "pickup"
                      ? "checkout-option--active"
                      : ""
                  }`}
                  type="button"
                  aria-pressed={
                    form.deliveryMethod ===
                    "pickup"
                  }
                  onClick={() =>
                    selectDeliveryMethod(
                      "pickup",
                    )
                  }
                >
                  <FaStore
                    aria-hidden="true"
                  />

                  <span>
                    <strong>
                      Retiro
                    </strong>

                    <small>
                      Retirá por el local
                    </small>
                  </span>
                </button>
              </div>

              {form.deliveryMethod ===
                "delivery" && (
                <label className="checkout-field checkout-field--full">
                  <span>
                    Dirección de entrega
                  </span>

                  <div className="checkout-field__icon-wrapper">
                    <FaLocationDot
                      aria-hidden="true"
                    />

                    <input
                      type="text"
                      name="address"
                      value={
                        form.address
                      }
                      placeholder="Calle, número, localidad y referencias"
                      autoComplete="street-address"
                      required
                      onChange={
                        handleInputChange
                      }
                    />
                  </div>
                </label>
              )}
            </section>

            {/* ========================================
                PAGO
            ======================================== */}

            <section className="checkout-section">
              <h2 className="checkout-section__title">
                Forma de pago
              </h2>

              <div className="checkout-options">
                <button
                  className={`checkout-option ${
                    form.paymentMethod ===
                    "cash"
                      ? "checkout-option--active"
                      : ""
                  }`}
                  type="button"
                  aria-pressed={
                    form.paymentMethod ===
                    "cash"
                  }
                  onClick={() =>
                    selectPaymentMethod(
                      "cash",
                    )
                  }
                >
                  <FaMoneyBillWave
                    aria-hidden="true"
                  />

                  <span>
                    <strong>
                      Efectivo
                    </strong>

                    <small>
                      Pagás al recibir
                    </small>
                  </span>
                </button>

                <button
                  className={`checkout-option ${
                    form.paymentMethod ===
                    "transfer"
                      ? "checkout-option--active"
                      : ""
                  }`}
                  type="button"
                  aria-pressed={
                    form.paymentMethod ===
                    "transfer"
                  }
                  onClick={() =>
                    selectPaymentMethod(
                      "transfer",
                    )
                  }
                >
                  <FaBuildingColumns
                    aria-hidden="true"
                  />

                  <span>
                    <strong>
                      Transferencia
                    </strong>

                    <small>
                      Te enviamos los datos
                    </small>
                  </span>
                </button>
              </div>
            </section>

            {/* ========================================
                ACLARACIONES
            ======================================== */}

            <section className="checkout-section">
              <h2 className="checkout-section__title">
                Aclaraciones
              </h2>

              <label className="checkout-field checkout-field--full">
                <span>
                  Notas generales
                </span>

                <textarea
                  name="notes"
                  value={
                    form.notes
                  }
                  placeholder="Ej: tocar timbre, entregar en portería..."
                  rows={4}
                  maxLength={300}
                  onChange={
                    handleInputChange
                  }
                />
              </label>
            </section>

            {/* ========================================
                WHATSAPP
            ======================================== */}

            <button
              className="checkout-submit"
              type="submit"
            >
              <FaWhatsapp
                aria-hidden="true"
              />

              <span>
                Finalizar por WhatsApp
              </span>
            </button>

            <p className="checkout-form__notice">
              Al continuar se abrirá
              WhatsApp directamente con
              tu pedido preparado.
            </p>
          </form>

          {/* ========================================
              RESUMEN
          ======================================== */}

          <aside className="checkout-summary">
            <h2 className="checkout-summary__title">
              Resumen del pedido
            </h2>

            <div className="checkout-summary__items">
              {checkoutItems.map(
                (item) => {
                  const unitPrice =
                    getUnitPrice(
                      item,
                    );

                  const customization =
                    getItemCustomization(
                      item,
                    );

                  const sizeName =
                    getOptionName(
                      customization.size,
                    );

                  const itemKey =
                    item.cartItemId ??
                    item.id;

                  return (
                    <article
                      className={[
                        "checkout-summary__item",
                        `checkout-summary__item--${item.id}`,
                      ].join(" ")}
                      key={
                        itemKey
                      }
                    >
                      {item.image && (
                        <img
                          className="checkout-summary__item-image"
                          src={
                            item.image
                          }
                          alt={
                            item.imageAlt ??
                            item.name
                          }
                        />
                      )}

                      <div className="checkout-summary__item-content">
                        <div className="checkout-summary__item-heading">
                          <h3>
                            {
                              item.quantity
                            }
                            x{" "}
                            {
                              item.name
                            }
                          </h3>

                          <strong>
                            {priceFormatter.format(
                              unitPrice *
                                item.quantity,
                            )}
                          </strong>
                        </div>

                        {sizeName && (
                          <p>
                            Tamaño:{" "}
                            {sizeName}
                          </p>
                        )}

                        {customization
                          .extras
                          .length >
                          0 && (
                          <p>
                            Extras:{" "}
                            {customization.extras
                              .map(
                                getOptionName,
                              )
                              .filter(
                                Boolean,
                              )
                              .join(
                                ", ",
                              )}
                          </p>
                        )}

                        {customization
                          .removedIngredients
                          .length >
                          0 && (
                          <p>
                            Sin:{" "}
                            {customization.removedIngredients.join(
                              ", ",
                            )}
                          </p>
                        )}

                        {customization.notes && (
                          <p>
                            Aclaración:{" "}
                            {
                              customization.notes
                            }
                          </p>
                        )}
                      </div>
                    </article>
                  );
                },
              )}
            </div>

            <div className="checkout-summary__row">
              <span>
                Unidades
              </span>

              <strong>
                {totalUnits}
              </strong>
            </div>

            <div className="checkout-summary__total">
              <span>
                Total
              </span>

              <strong>
                {priceFormatter.format(
                  totalPrice,
                )}
              </strong>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}