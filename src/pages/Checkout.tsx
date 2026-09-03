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
  FaTruck,
  FaWhatsapp,
} from "react-icons/fa6";

import { Link } from "react-router-dom";

import { useCart } from "../hooks/useCart";

import {
  useStoreStatus,
} from "../hooks/useStoreStatus";

import {
  createOrder,
} from "../services/ordersApi";

import type {
  CreatedOrderItem,
} from "../services/ordersApi";

import type {
  ProductChoiceSelection,
} from "../types/Product";

import "../styles/Checkout.css";

/* ========================================
   WHATSAPP
======================================== */

/*
  Confirmar este número con el cliente
  antes de publicar el sitio.
*/
const WHATSAPP_NUMBER =
  "5491138065902";

/* ========================================
   TIPOS
======================================== */

type DeliveryMethod =
  "delivery";

type PaymentMethod =
  | "cash"
  | "transfer";

type CheckoutForm = {
  customerName: string;

  phone: string;

  deliveryMethod:
    DeliveryMethod;

  address: string;

  paymentMethod:
    PaymentMethod;

  notes: string;
};

type CheckoutOption = {
  id?: string;

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

  choices?: ProductChoiceSelection[];

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

  customization?:
    CheckoutCustomization;

  selectedSize?:
    CheckoutOption;

  selectedExtras?:
    CheckoutOption[];

  removedIngredients?:
    string[];

  notes?: string;
};

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
   NOMBRE DE OPCIÓN
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

/* ========================================
   PRECIO UNITARIO
======================================== */

function getUnitPrice(
  item: CheckoutCartItem,
): number {
  return (
    item.unitPrice ??
    item.price
  );
}

/* ========================================
   PERSONALIZACIÓN
======================================== */

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
    customization
      ?.removedIngredients ??
    item.removedIngredients ??
    [];

  const choices =
    customization?.choices ??
    [];

  const notes =
    customization
      ?.notes
      ?.trim() ||
    item.notes?.trim() ||
    "";

  return {
    size,
    extras,
    removedIngredients,
    choices,
    notes,
  };
}

/* ========================================
   PRODUCTO PARA WHATSAPP
======================================== */

function createProductMessage(
  item: CreatedOrderItem,
): string {
  const lines: string[] = [
    `*${item.quantity}x ${item.name}*`,

    `Subtotal: ${priceFormatter.format(
      item.lineTotal,
    )}`,
  ];

  const sizeName =
    item.customization.size
      ? getOptionName(
          item.customization.size,
        )
      : "";

  if (sizeName) {
    lines.push(
      `Tamaño: ${sizeName}`,
    );
  }

  if (
    item.customization.extras.length >
    0
  ) {
    const extrasNames =
      item.customization.extras
        .map(
          getOptionName,
        )
        .filter(Boolean)
        .join(", ");

    if (extrasNames) {
      lines.push(
        `Extras: ${extrasNames}`,
      );
    }
  }

  if (
    item.customization
      .removedIngredients
      .length > 0
  ) {
    lines.push(
      `Sin: ${item.customization.removedIngredients.join(
        ", ",
      )}`,
    );
  }

  for (const choice of (
    item.customization.choices ?? []
  )) {
    lines.push(
      `${choice.groupLabel}: ${choice.optionLabel}`,
    );

    if (
      choice.removedIngredients.length > 0
    ) {
      lines.push(
        `Sin en ${choice.groupLabel}: ${choice.removedIngredients.join(
          ", ",
        )}`,
      );
    }
  }

  if (
    item.customization.notes
  ) {
    lines.push(
      `Aclaración: ${item.customization.notes}`,
    );
  }

  return lines.join("\n");
}

/* ========================================
   COMPONENTE
======================================== */

export function Checkout() {
  const {
    cart,
  } = useCart();

  const checkoutItems =
    cart as CheckoutCartItem[];

  const {
    isOpen,
    statusLabel,
    detailLabel,
  } = useStoreStatus();

  const [
    form,
    setForm,
  ] =
    useState<CheckoutForm>({
      customerName: "",

      phone: "",

      deliveryMethod:
        "delivery",

      address: "",

      paymentMethod:
        "cash",

      notes: "",
    });

  const [
    submittingOrder,
    setSubmittingOrder,
  ] =
    useState(false);

  const [
    orderError,
    setOrderError,
  ] =
    useState<string | null>(
      null,
    );

  /* ========================================
     TOTAL PRODUCTOS
  ======================================== */

  const totalPrice =
    checkoutItems.reduce(
      (
        total,
        item,
      ) =>
        total +
        getUnitPrice(
          item,
        ) *
          item.quantity,

      0,
    );

  /* ========================================
     UNIDADES
  ======================================== */

  const totalUnits =
    checkoutItems.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.quantity,

      0,
    );

  /* ========================================
     INPUTS
  ======================================== */

  const handleInputChange = (
    event:
      ChangeEvent<
        | HTMLInputElement
        | HTMLTextAreaElement
      >,
  ) => {
    const {
      name,
      value,
    } =
      event.target;

    setForm(
      (
        currentForm,
      ) => ({
        ...currentForm,

        [name]:
          value,
      }),
    );
  };

  /* ========================================
     PAGO
  ======================================== */

  const selectPaymentMethod = (
    method:
      PaymentMethod,
  ) => {
    setForm(
      (
        currentForm,
      ) => ({
        ...currentForm,

        paymentMethod:
          method,
      }),
    );
  };

  /* ========================================
     FINALIZAR
  ======================================== */

  const handleSubmit =
    async (
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

      if (!isOpen) {
        setOrderError(
          `${statusLabel}. ${detailLabel}`,
        );

        return;
      }

      /* ========================================
         VALIDACIONES
      ======================================== */

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
        checkoutItems.length ===
        0
      ) {
        return;
      }

      setOrderError(null);
      setSubmittingOrder(true);

      try {
        /* ======================================
           PREPARAR PEDIDO PARA LA API
        ====================================== */

        const orderItems =
          checkoutItems.map(
            (item) => {
              const legacyId =
                Number(item.id);

              if (
                !Number.isInteger(
                  legacyId,
                ) ||
                legacyId <= 0
              ) {
                throw new Error(
                  `No pudimos identificar correctamente "${item.name}". Volvé al carrito e intentá nuevamente.`,
                );
              }

              const customization =
                getItemCustomization(
                  item,
                );

              const sizeId =
                customization.size
                  ?.id
                  ?.trim();

              if (
                customization.size &&
                !sizeId
              ) {
                throw new Error(
                  `La personalización de "${item.name}" quedó desactualizada. Volvé a personalizar el producto.`,
                );
              }

              const extraIds =
                customization.extras.map(
                  (extra) =>
                    extra.id?.trim() ??
                    "",
                );

              if (
                extraIds.some(
                  (extraId) =>
                    !extraId,
                )
              ) {
                throw new Error(
                  `Uno de los extras de "${item.name}" quedó desactualizado. Volvé a personalizar el producto.`,
                );
              }

              return {
                legacyId,

                quantity:
                  item.quantity,

                customization: {
                  sizeId:
                    sizeId ||
                    undefined,

                  extraIds,

                  removedIngredients:
                    customization
                      .removedIngredients,

                  choices:
                    customization.choices.map(
                      (choice) => ({
                        groupId:
                          choice.groupId,

                        optionId:
                          choice.option.id,

                        removedIngredients:
                          choice.removedIngredients,
                      }),
                    ),

                  notes:
                    customization.notes,
                },
              };
            },
          );

        /* ======================================
           REGISTRAR EN MONGODB
        ====================================== */

        const createdOrder =
          await createOrder({
            customer: {
              name:
                customerName,

              phone,

              address,
            },

            deliveryMethod:
              form.deliveryMethod,

            paymentMethod:
              form.paymentMethod,

            items:
              orderItems,

            generalNotes:
              notes,
          });

        /* ========================================
           ENTREGA
        ======================================== */

        const deliveryText =
          "Envío a domicilio - Hurlingham";

        /* ========================================
           PAGO
        ======================================== */

        const paymentText =
          createdOrder.paymentMethod ===
          "cash"
            ? "Efectivo"
            : "Transferencia";

        /* ========================================
           PRODUCTOS
        ======================================== */

        const productsText =
          createdOrder.items
            .map(
              createProductMessage,
            )
            .join("\n\n");

        /* ========================================
           MENSAJE WHATSAPP
        ======================================== */

        /*
          En este punto el pedido ya quedó
          guardado en MongoDB.

          El mensaje se arma con el snapshot que
          devolvió el backend, no con precios que
          puedan haber quedado viejos en el carrito.
        */

        const messageLines:
          string[] =
          [
            `*NUEVO PEDIDO LOONGIS #${createdOrder.orderNumber}*`,

            "------------------------------",

            "",

            `*Cliente:* ${createdOrder.customer.name}`,

            `*Teléfono:* ${createdOrder.customer.phone}`,

            `*Entrega:* ${deliveryText}`,
          ];

        /* ========================================
           DIRECCIÓN
        ======================================== */

        if (
          createdOrder.deliveryMethod ===
          "delivery"
        ) {
          messageLines.push(
            `*Dirección:* ${createdOrder.customer.address}`,

            "*Zona:* Hurlingham",
          );
        }

        /* ========================================
           PAGO
        ======================================== */

        messageLines.push(
          `*Pago:* ${paymentText}`,

          "",

          "------------------------------",

          "*PEDIDO*",

          "------------------------------",

          "",

          productsText,

          "",

          "------------------------------",

          `*Unidades:* ${totalUnits}`,

          `*TOTAL PRODUCTOS: ${priceFormatter.format(
            createdOrder.productsTotal,
          )}*`,
        );

        /* ========================================
           ENVÍO
        ======================================== */

        if (
          createdOrder.deliveryMethod ===
          "delivery"
        ) {
          messageLines.push(
            "*Costo de envío:* A confirmar",
          );
        }

        /* ========================================
           ACLARACIONES GENERALES
        ======================================== */

        if (
          createdOrder.generalNotes
        ) {
          messageLines.push(
            "",

            "*Aclaraciones generales:*",

            createdOrder.generalNotes,
          );
        }

        /* ========================================
           FIRMA
        ======================================== */

        messageLines.push(
          "",

          "------------------------------",

          `Pedido #${createdOrder.orderNumber} registrado en Loongis`,
        );

        /* ========================================
           TEXTO FINAL
        ======================================== */

        const message =
          messageLines.join("\n");

        /* ========================================
           URL WHATSAPP
        ======================================== */

        const encodedMessage =
          encodeURIComponent(
            message,
          );

        const whatsappUrl =
          `https://wa.me/${WHATSAPP_NUMBER}` +
          `?text=${encodedMessage}`;

        /* ========================================
           ABRIR WHATSAPP
        ======================================== */

        window.location.assign(
          whatsappUrl,
        );
      } catch (error) {
        setOrderError(
          error instanceof Error
            ? error.message
            : "No se pudo registrar el pedido. Intentá nuevamente.",
        );
      } finally {
        setSubmittingOrder(
          false,
        );
      }
    };

  /* ========================================
     CARRITO VACÍO
  ======================================== */

  if (
    checkoutItems.length ===
    0
  ) {
    return (
      <main className="checkout-page">
        <div className="checkout-page__container">
          <section
            className="checkout-empty"
            aria-labelledby="checkout-empty-title"
          >
            <span className="checkout-empty__eyebrow">
              Tu pedido
            </span>

            <h1
              className="checkout-empty__title"
              id="checkout-empty-title"
            >
              El carrito está vacío
            </h1>

            <p className="checkout-empty__description">
              Agregá algún producto antes
              de finalizar el pedido.
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
            HEADER
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
                    inputMode="tel"
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

            <section
              className="checkout-section"
              aria-labelledby="checkout-delivery-title"
            >
              <h2
                className="checkout-section__title"
                id="checkout-delivery-title"
              >
                Forma de entrega
              </h2>

              <div className="checkout-options">
                <div className="checkout-option checkout-option--active">
                  <FaTruck
                    aria-hidden="true"
                  />

                  <span>
                    <strong>
                      Envío
                    </strong>

                    <small>
                      Solo Hurlingham
                    </small>
                  </span>
                </div>
              </div>

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
                      placeholder="Calle, número y referencias"
                      autoComplete="street-address"
                      aria-label="Dirección de entrega dentro de Hurlingham"
                      required
                      onChange={
                        handleInputChange
                      }
                    />
                  </div>
              </label>
            </section>

            {/* ========================================
                PAGO
            ======================================== */}

            <section
              className="checkout-section"
              aria-labelledby="checkout-payment-title"
            >
              <h2
                className="checkout-section__title"
                id="checkout-payment-title"
              >
                Forma de pago
              </h2>

              <div
                className="checkout-options"
                role="group"
                aria-labelledby="checkout-payment-title"
              >
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

            {orderError && (
              <p
                className="checkout-form__notice"
                role="alert"
              >
                {orderError}
              </p>
            )}

            {!isOpen && (
              <div
                className="checkout-store-status"
                role="status"
              >
                <strong>
                  {statusLabel}
                </strong>

                <span>
                  {detailLabel}
                </span>
              </div>
            )}

            <button
              className="checkout-submit"
              type="submit"
              aria-describedby="checkout-whatsapp-notice"
              disabled={
                submittingOrder ||
                !isOpen
              }
            >
              <FaWhatsapp
                aria-hidden="true"
              />

              <span>
                {!isOpen
                  ? "Pedidos no disponibles"
                  : submittingOrder
                  ? "Registrando pedido..."
                  : "Finalizar por WhatsApp"}
              </span>
            </button>

            <p
              className="checkout-form__notice"
              id="checkout-whatsapp-notice"
            >
              Primero registramos el
              pedido y luego se abrirá
              WhatsApp con el mensaje
              preparado.
            </p>
          </form>

          {/* ========================================
              RESUMEN
          ======================================== */}

          <aside
            className="checkout-summary"
            aria-labelledby="checkout-summary-title"
          >
            <h2
              className="checkout-summary__title"
              id="checkout-summary-title"
            >
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

                        {customization.choices.map(
                          (choice) => (
                            <div key={choice.groupId}>
                              <p>
                                {choice.groupLabel}: {choice.option.label}
                              </p>

                              {choice.removedIngredients.length > 0 && (
                                <p>
                                  Sin en {choice.groupLabel}: {choice.removedIngredients.join(
                                    ", ",
                                  )}
                                </p>
                              )}
                            </div>
                          ),
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

            {/* ========================================
                UNIDADES
            ======================================== */}

            <div className="checkout-summary__row">
              <span>
                Unidades
              </span>

              <strong>
                {totalUnits}
              </strong>
            </div>

            {/* ========================================
                ENVÍO
            ======================================== */}

            <div className="checkout-summary__row">
              <span>
                Envío
              </span>

              <strong>
                A confirmar
              </strong>
            </div>

            {/* ========================================
                TOTAL PRODUCTOS
            ======================================== */}

            <div className="checkout-summary__total">
              <span>
                Total productos
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
