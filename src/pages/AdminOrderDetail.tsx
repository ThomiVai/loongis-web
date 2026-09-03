import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  Navigate,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";

import type {
  ProtectedAdminOutletContext,
} from "../components/ProtectedAdminRoute";

import {
  getAdminOrderById,
  updateAdminOrderStatus,
} from "../services/adminOrdersApi";

import type {
  AdminOrder,
  AdminOrderStatus,
} from "../services/adminOrdersApi";

import {
  getAdminToken,
  removeAdminToken,
} from "../utils/adminSession";

import "../styles/AdminDashboard.css";
import "../styles/AdminOrders.css";
import "../styles/AdminOrderDetail.css";

/* ========================================
   FORMATO
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

const dateFormatter =
  new Intl.DateTimeFormat(
    "es-AR",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );

function formatDate(
  value?: string,
): string {
  if (!value) {
    return "Fecha no disponible";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Fecha no disponible";
  }

  return dateFormatter.format(
    date,
  );
}

function getStatusLabel(
  status: AdminOrderStatus,
): string {
  if (status === "confirmed") {
    return "Confirmado";
  }

  if (status === "cancelled") {
    return "Cancelado";
  }

  return "Pendiente";
}

function getDeliveryLabel(
  order: AdminOrder,
): string {
  return order.deliveryMethod ===
    "delivery"
    ? "Envío a domicilio"
    : "Retiro por el local";
}

function getPaymentLabel(
  order: AdminOrder,
): string {
  return order.paymentMethod ===
    "cash"
    ? "Efectivo"
    : "Transferencia";
}

function isAuthError(
  message: string,
): boolean {
  const normalized =
    message.toLowerCase();

  return (
    normalized.includes(
      "sesión",
    ) ||
    normalized.includes(
      "autentic",
    ) ||
    normalized.includes(
      "token",
    )
  );
}

/* ========================================
   COMPONENTE
======================================== */

export function AdminOrderDetail() {
  const navigate =
    useNavigate();

  const {
    orderId,
  } =
    useParams();

  const {
    admin,
  } =
    useOutletContext<ProtectedAdminOutletContext>();

  const token =
    getAdminToken();

  const [
    order,
    setOrder,
  ] =
    useState<AdminOrder | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    changingStatus,
    setChangingStatus,
  ] =
    useState<
      | "confirmed"
      | "cancelled"
      | null
    >(null);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  /* ========================================
     SESIÓN
  ======================================== */

  const handleLogout = () => {
    removeAdminToken();

    navigate(
      "/admin/login",
      {
        replace: true,
      },
    );
  };

  /* ========================================
     CARGAR PEDIDO
  ======================================== */

  useEffect(() => {
    if (
      !token ||
      !orderId
    ) {
      return;
    }

    const currentOrderId =
      orderId;

    const currentToken =
      token;

    let mounted =
      true;

    async function loadOrder() {
      try {
        setLoading(true);
        setError(null);

        const data =
          await getAdminOrderById(
            currentOrderId,
            currentToken,
          );

        if (!mounted) {
          return;
        }

        setOrder(data);
      } catch (loadError) {
        if (!mounted) {
          return;
        }

        const message =
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el pedido.";

        if (
          isAuthError(message)
        ) {
          removeAdminToken();

          navigate(
            "/admin/login",
            {
              replace: true,
            },
          );

          return;
        }

        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadOrder();

    return () => {
      mounted = false;
    };
  }, [
    navigate,
    orderId,
    token,
  ]);

  /* ========================================
     CAMBIAR ESTADO
  ======================================== */

  const handleStatusChange =
    async (
      nextStatus:
        | "confirmed"
        | "cancelled",
    ) => {
      if (
        !order ||
        !token
      ) {
        return;
      }

      const confirmationMessage =
        nextStatus ===
        "confirmed"
          ? `¿Seguro que querés confirmar el pedido #${order.orderNumber}? Al confirmarlo se descontará el stock según las recetas configuradas.`
          : `¿Seguro que querés cancelar el pedido #${order.orderNumber}?`;

      const confirmed =
        window.confirm(
          confirmationMessage,
        );

      if (!confirmed) {
        return;
      }

      setChangingStatus(
        nextStatus,
      );
      setError(null);

      try {
        const updatedOrder =
          await updateAdminOrderStatus(
            order._id,
            token,
            nextStatus,
          );

        setOrder(
          updatedOrder,
        );
      } catch (updateError) {
        const message =
          updateError instanceof Error
            ? updateError.message
            : "No se pudo actualizar el pedido.";

        if (
          isAuthError(message)
        ) {
          removeAdminToken();

          navigate(
            "/admin/login",
            {
              replace: true,
            },
          );

          return;
        }

        setError(message);
      } finally {
        setChangingStatus(null);
      }
    };

  /* ========================================
     VALIDACIONES DE RUTA
  ======================================== */

  if (!token) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  if (!orderId) {
    return (
      <Navigate
        to="/admin/pedidos"
        replace
      />
    );
  }

  /* ========================================
     CARGANDO
  ======================================== */

  if (loading) {
    return (
      <main className="admin-dashboard">
        <div className="admin-dashboard__loading">
          Cargando pedido...
        </div>
      </main>
    );
  }

  /* ========================================
     ERROR SIN PEDIDO
  ======================================== */

  if (
    error &&
    !order
  ) {
    return (
      <main className="admin-dashboard">
        <div className="admin-dashboard__container">
          <div className="admin-order-detail__load-error">
            <h1>
              No pudimos cargar el pedido
            </h1>

            <p>
              {error}
            </p>

            <Link
              to="/admin/pedidos"
              className="admin-order-detail__back-button"
            >
              Volver a pedidos
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return null;
  }

  /* ========================================
     DETALLE
  ======================================== */

  return (
    <main className="admin-dashboard">
      <div className="admin-dashboard__container">

        <header className="admin-dashboard__header">
          <div>
            <span className="admin-dashboard__eyebrow">
              Loongis
            </span>

            <h1>
              Panel administrador
            </h1>

            <p>
              Sesión iniciada como{" "}
              <strong>
                {admin.email}
              </strong>
            </p>
          </div>

          <div className="admin-dashboard__header-actions">
            <Link
              to="/"
              className="admin-dashboard__store-link"
            >
              ← Volver a la tienda
            </Link>

            <button
              type="button"
              className="admin-dashboard__logout"
              onClick={
                handleLogout
              }
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <nav
          className="admin-dashboard__nav"
          aria-label="Secciones del panel administrador"
        >
          <Link
            to="/admin"
            className="admin-dashboard__nav-link"
          >
            Productos
          </Link>

          <Link
            to="/admin/pedidos"
            className="admin-dashboard__nav-link admin-dashboard__nav-link--active"
            aria-current="page"
          >
            Pedidos
          </Link>

          <Link
            to="/admin/inventario"
            className="admin-dashboard__nav-link"
          >
            Inventario
          </Link>

          <Link
            to="/admin/recetas"
            className="admin-dashboard__nav-link"
          >
            Recetas
          </Link>
        </nav>

        <Link
          to="/admin/pedidos"
          className="admin-order-detail__back"
        >
          ← Volver a pedidos
        </Link>

        <article className="admin-order-detail">
          <header className="admin-order-detail__header">
            <div>
              <span
                className={[
                  "admin-order-status",
                  `admin-order-status--${order.status}`,
                ].join(" ")}
              >
                {getStatusLabel(
                  order.status,
                )}
              </span>

              <h2>
                Pedido #{order.orderNumber}
              </h2>

              <p>
                Recibido el{" "}
                {formatDate(
                  order.createdAt,
                )}
              </p>
            </div>

            <strong className="admin-order-detail__grand-total">
              {priceFormatter.format(
                order.total,
              )}
            </strong>
          </header>

          {error && (
            <div
              className="admin-order-detail__error"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="admin-order-detail__info-grid">
            <section className="admin-order-detail__section">
              <h3>
                Cliente
              </h3>

              <dl className="admin-order-detail__data">
                <div>
                  <dt>
                    Nombre
                  </dt>
                  <dd>
                    {order.customer.name}
                  </dd>
                </div>

                <div>
                  <dt>
                    Teléfono
                  </dt>
                  <dd>
                    {order.customer.phone}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="admin-order-detail__section">
              <h3>
                Entrega y pago
              </h3>

              <dl className="admin-order-detail__data">
                <div>
                  <dt>
                    Entrega
                  </dt>
                  <dd>
                    {getDeliveryLabel(
                      order,
                    )}
                  </dd>
                </div>

                <div>
                  <dt>
                    Pago
                  </dt>
                  <dd>
                    {getPaymentLabel(
                      order,
                    )}
                  </dd>
                </div>

                {order.deliveryMethod ===
                  "delivery" && (
                  <div>
                    <dt>
                      Dirección
                    </dt>
                    <dd>
                      {order.customer.address}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          </div>

          <section className="admin-order-detail__section admin-order-detail__section--items">
            <div className="admin-order-detail__section-heading">
              <h3>
                Productos
              </h3>

              <span>
                {order.items.length}{" "}
                {order.items.length === 1
                  ? "línea"
                  : "líneas"}
              </span>
            </div>

            <div className="admin-order-detail__items">
              {order.items.map(
                (
                  item,
                  index,
                ) => (
                  <article
                    className="admin-order-detail__item"
                    key={`${item.legacyId}-${index}`}
                  >
                    <div className="admin-order-detail__item-main">
                      <div className="admin-order-detail__item-heading">
                        <h4>
                          {item.quantity}x{" "}
                          {item.name}
                        </h4>

                        <strong>
                          {priceFormatter.format(
                            item.lineTotal,
                          )}
                        </strong>
                      </div>

                      <span className="admin-order-detail__unit-price">
                        {priceFormatter.format(
                          item.unitPrice,
                        )}{" "}
                        c/u
                      </span>

                      <div className="admin-order-detail__customization">
                        {item.customization.size && (
                          <p>
                            <strong>
                              Tamaño:
                            </strong>{" "}
                            {item.customization.size.name}
                          </p>
                        )}

                        {item.customization.extras.length > 0 && (
                          <p>
                            <strong>
                              Extras:
                            </strong>{" "}
                            {item.customization.extras
                              .map(
                                (extra) =>
                                  extra.name,
                              )
                              .join(", ")}
                          </p>
                        )}

                        {item.customization.removedIngredients.length > 0 && (
                          <p>
                            <strong>
                              Sin:
                            </strong>{" "}
                            {item.customization.removedIngredients.join(", ")}
                          </p>
                        )}

                        {(item.customization.choices ?? []).map(
                          (choice) => (
                            <div key={choice.groupId}>
                              <p>
                                <strong>
                                  {choice.groupLabel}:
                                </strong>{" "}
                                {choice.optionLabel}
                              </p>

                              {choice.removedIngredients.length > 0 && (
                                <p>
                                  <strong>
                                    Sin en {choice.groupLabel}:
                                  </strong>{" "}
                                  {choice.removedIngredients.join(", ")}
                                </p>
                              )}
                            </div>
                          ),
                        )}

                        {item.customization.notes && (
                          <p>
                            <strong>
                              Aclaración:
                            </strong>{" "}
                            {item.customization.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                ),
              )}
            </div>
          </section>

          {order.generalNotes && (
            <section className="admin-order-detail__section">
              <h3>
                Notas generales
              </h3>

              <p className="admin-order-detail__notes">
                {order.generalNotes}
              </p>
            </section>
          )}

          <section className="admin-order-detail__totals">
            <div>
              <span>
                Productos
              </span>

              <strong>
                {priceFormatter.format(
                  order.productsTotal,
                )}
              </strong>
            </div>

            <div>
              <span>
                Envío
              </span>

              <strong>
                {order.deliveryCost ===
                null
                  ? "A confirmar"
                  : priceFormatter.format(
                      order.deliveryCost,
                    )}
              </strong>
            </div>

            <div className="admin-order-detail__total-row">
              <span>
                Total registrado
              </span>

              <strong>
                {priceFormatter.format(
                  order.total,
                )}
              </strong>
            </div>
          </section>

          {order.status ===
            "pending" ? (
            <footer className="admin-order-detail__actions">
              <button
                type="button"
                className="admin-order-detail__confirm"
                onClick={() =>
                  void handleStatusChange(
                    "confirmed",
                  )
                }
                disabled={
                  changingStatus !==
                  null
                }
              >
                {changingStatus ===
                "confirmed"
                  ? "Confirmando..."
                  : "Confirmar pedido"}
              </button>

              <button
                type="button"
                className="admin-order-detail__cancel"
                onClick={() =>
                  void handleStatusChange(
                    "cancelled",
                  )
                }
                disabled={
                  changingStatus !==
                  null
                }
              >
                {changingStatus ===
                "cancelled"
                  ? "Cancelando..."
                  : "Cancelar pedido"}
              </button>
            </footer>
          ) : (
            <footer className="admin-order-detail__final-state">
              Este pedido quedó{" "}
              <strong>
                {getStatusLabel(
                  order.status,
                ).toLowerCase()}
              </strong>
              .
            </footer>
          )}
        </article>
      </div>
    </main>
  );
}
