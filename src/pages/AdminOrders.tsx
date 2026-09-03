import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useOutletContext,
} from "react-router-dom";

import type {
  ProtectedAdminOutletContext,
} from "../components/ProtectedAdminRoute";

import {
  getAdminOrders,
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

/* ========================================
   TIPOS
======================================== */

type OrderFilter =
  | "all"
  | AdminOrderStatus;

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
      dateStyle: "short",
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
    ? "Envío"
    : "Retiro";
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

export function AdminOrders() {
  const navigate =
    useNavigate();

  const {
    admin,
  } =
    useOutletContext<ProtectedAdminOutletContext>();

  const token =
    getAdminToken();

  const [
    orders,
    setOrders,
  ] =
    useState<AdminOrder[]>([]);

  const [
    filter,
    setFilter,
  ] =
    useState<OrderFilter>(
      "all",
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

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
     CARGAR PEDIDOS
  ======================================== */

  useEffect(() => {
    if (!token) {
      return;
    }

    const currentToken =
      token;

    const currentFilter =
      filter;

    let cancelled =
      false;

    async function loadOrders() {
      try {
        const data =
          await getAdminOrders(
            currentToken,
            currentFilter === "all"
              ? undefined
              : currentFilter,
          );

        if (cancelled) {
          return;
        }

        setOrders(data);
        setError(null);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        const message =
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar los pedidos.";

        if (
          isAuthError(
            message,
          )
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
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, [
    filter,
    navigate,
    token,
  ]);

  /* ========================================
     ACTUALIZAR MANUALMENTE
  ======================================== */

  const handleRefresh =
    async () => {
      if (!token) {
        removeAdminToken();

        navigate(
          "/admin/login",
          {
            replace: true,
          },
        );

        return;
      }

      setRefreshing(true);
      setError(null);

      try {
        const data =
          await getAdminOrders(
            token,
            filter === "all"
              ? undefined
              : filter,
          );

        setOrders(data);
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar los pedidos.";

        if (
          isAuthError(
            message,
          )
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
        setRefreshing(false);
      }
    };

  /* ========================================
     CAMBIAR FILTRO
  ======================================== */

  const handleFilterChange = (
    nextFilter: OrderFilter,
  ) => {
    if (nextFilter === filter) {
      return;
    }

    setLoading(true);
    setError(null);
    setFilter(nextFilter);
  };

  /* ========================================
     VISTA
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

        <section className="admin-orders">
          <header className="admin-orders__header">
            <div>
              <span className="admin-orders__eyebrow">
                Gestión
              </span>

              <h2>
                Pedidos
              </h2>

              <p>
                Revisá los pedidos recibidos y confirmá o cancelá cada solicitud.
              </p>
            </div>

            <div className="admin-orders__header-actions">
              {!loading &&
                !error && (
                  <span className="admin-orders__count">
                    {orders.length}{" "}
                    {orders.length === 1
                      ? "pedido"
                      : "pedidos"}
                  </span>
                )}

              <button
                type="button"
                className="admin-orders__refresh"
                onClick={() =>
                  void handleRefresh()
                }
                disabled={refreshing}
              >
                {refreshing
                  ? "Actualizando..."
                  : "Actualizar"}
              </button>
            </div>
          </header>

          <div
            className="admin-orders__filters"
            aria-label="Filtrar pedidos por estado"
          >
            {(
              [
                ["all", "Todos"],
                ["pending", "Pendientes"],
                ["confirmed", "Confirmados"],
                ["cancelled", "Cancelados"],
              ] as const
            ).map(
              ([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={[
                    "admin-orders__filter",
                    filter === value
                      ? "admin-orders__filter--active"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-pressed={
                    filter === value
                  }
                  onClick={() =>
                    handleFilterChange(
                      value,
                    )
                  }
                >
                  {label}
                </button>
              ),
            )}
          </div>

          {error && (
            <div
              className="admin-orders__error"
              role="alert"
            >
              <strong>
                Ocurrió un problema
              </strong>

              <span>
                {error}
              </span>
            </div>
          )}

          {loading && (
            <div className="admin-orders__message">
              Cargando pedidos...
            </div>
          )}

          {!loading &&
            !error &&
            orders.length === 0 && (
              <div className="admin-orders__message">
                No hay pedidos para este filtro.
              </div>
            )}

          {!loading &&
            !error &&
            orders.length > 0 && (
              <div className="admin-orders__list">
                {orders.map(
                  (order) => (
                    <article
                      key={order._id}
                      className="admin-order-card"
                    >
                      <div className="admin-order-card__main">
                        <div className="admin-order-card__top">
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

                            <h3>
                              Pedido #{order.orderNumber}
                            </h3>
                          </div>

                          <strong className="admin-order-card__total">
                            {priceFormatter.format(
                              order.total,
                            )}
                          </strong>
                        </div>

                        <div className="admin-order-card__customer">
                          <strong>
                            {order.customer.name}
                          </strong>

                          <span>
                            {order.customer.phone}
                          </span>
                        </div>

                        <div className="admin-order-card__meta">
                          <span>
                            {getDeliveryLabel(
                              order,
                            )}
                          </span>

                          <span>
                            {getPaymentLabel(
                              order,
                            )}
                          </span>

                          <span>
                            {order.items.length}{" "}
                            {order.items.length === 1
                              ? "línea"
                              : "líneas"}
                          </span>

                          <span>
                            {formatDate(
                              order.createdAt,
                            )}
                          </span>
                        </div>
                      </div>

                      <Link
                        to={`/admin/pedidos/${order._id}`}
                        className="admin-order-card__detail"
                      >
                        Ver pedido
                      </Link>
                    </article>
                  ),
                )}
              </div>
            )}
        </section>
      </div>
    </main>
  );
}
