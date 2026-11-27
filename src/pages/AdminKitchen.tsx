import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAdminOrders, updateAdminKitchenStatus } from "../services/adminOrdersApi";
import type { AdminKitchenStatus, AdminOrder } from "../services/adminOrdersApi";
import { getAdminToken, removeAdminToken } from "../utils/adminSession";
import "../styles/AdminKitchen.css";

type LaneStatus = "new" | "preparing" | "ready";

const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

function getKitchenStatus(order: AdminOrder): AdminKitchenStatus {
  if (order.status === "pending") return "new";
  if (order.status === "confirmed" && (!order.kitchenStatus || order.kitchenStatus === "new")) {
    return "preparing";
  }
  return order.kitchenStatus ?? "new";
}

function getAgeLabel(value?: string): string {
  if (!value) return "Hora no disponible";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Hora no disponible";
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  return minutes < 1 ? "Recién recibido" : `Hace ${minutes} min`;
}

function isAuthError(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("sesión") || normalized.includes("autentic") || normalized.includes("token");
}

function getNextStatus(status: LaneStatus): Exclude<AdminKitchenStatus, "new"> {
  if (status === "new") return "preparing";
  if (status === "preparing") return "ready";
  return "completed";
}

function getActionLabel(status: LaneStatus): string {
  if (status === "new") return "Aceptar y empezar";
  if (status === "preparing") return "Marcar como listo";
  return "Marcar como entregado";
}

function getDeliveryLabel(order: AdminOrder): string {
  return order.deliveryMethod === "delivery" ? "Envío" : "Retiro";
}

function getPaymentLabel(order: AdminOrder): string {
  return order.paymentMethod === "cash" ? "Efectivo" : "Transferencia";
}

export function AdminKitchen() {
  const navigate = useNavigate();
  const token = getAdminToken();
  const inFlight = useRef(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadOrders = useCallback(async (silent = false) => {
    if (!token) {
      removeAdminToken();
      navigate("/admin/login", { replace: true });
      return;
    }
    if (inFlight.current) return;
    inFlight.current = true;
    if (!silent) setRefreshing(true);

    try {
      const data = await getAdminOrders(token);
      setOrders(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (loadError) {
      const message = loadError instanceof Error
        ? loadError.message
        : "No se pudieron cargar los pedidos.";
      if (isAuthError(message)) {
        removeAdminToken();
        navigate("/admin/login", { replace: true });
        return;
      }
      setError(message);
    } finally {
      inFlight.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate, token]);

  useEffect(() => {
    void loadOrders();
    const interval = window.setInterval(() => void loadOrders(true), 10000);
    return () => window.clearInterval(interval);
  }, [loadOrders]);

  const activeOrders = useMemo(
    () => orders.filter((order) => order.status !== "cancelled" && getKitchenStatus(order) !== "completed"),
    [orders],
  );

  const groupedOrders = useMemo(() => ({
    new: activeOrders.filter((order) => getKitchenStatus(order) === "new"),
    preparing: activeOrders.filter((order) => getKitchenStatus(order) === "preparing"),
    ready: activeOrders.filter((order) => getKitchenStatus(order) === "ready"),
  }), [activeOrders]);

  const handleAdvance = async (order: AdminOrder, lane: LaneStatus) => {
    if (!token || updatingId) return;
    setUpdatingId(order._id);
    setError(null);
    try {
      const updated = await updateAdminKitchenStatus(order._id, token, getNextStatus(lane));
      setOrders((current) => current.map((item) => item._id === updated._id ? updated : item));
      setLastUpdated(new Date());
    } catch (updateError) {
      const message = updateError instanceof Error
        ? updateError.message
        : "No se pudo avanzar el pedido.";
      if (isAuthError(message)) {
        removeAdminToken();
        navigate("/admin/login", { replace: true });
        return;
      }
      setError(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const lanes: { id: LaneStatus; title: string; helper: string }[] = [
    { id: "new", title: "Nuevos", helper: "Esperan aceptación" },
    { id: "preparing", title: "En preparación", helper: "Ya aceptados por cocina" },
    { id: "ready", title: "Listos", helper: "Esperan entrega o retiro" },
  ];

  return (
    <main className="admin-dashboard admin-kitchen-page">
      <div className="admin-dashboard__container">
        <header className="admin-dashboard__header admin-kitchen__header">
          <div>
            <span className="admin-dashboard__eyebrow">Operación Loongis</span>
            <h1>Cocina</h1>
            <p>Pedidos claros y ordenados para preparar sin perder detalles.</p>
          </div>
          <div className="admin-dashboard__header-actions admin-kitchen__header-actions">
            <span className="admin-kitchen__updated" aria-live="polite">
              {lastUpdated ? `Actualizado ${lastUpdated.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}` : "Conectando…"}
            </span>
            <button type="button" className="admin-kitchen__refresh" onClick={() => void loadOrders()} disabled={refreshing}>
              {refreshing ? "Actualizando…" : "Actualizar"}
            </button>
            <Link to="/admin/pedidos" className="admin-kitchen__all-orders">Todos los pedidos</Link>
          </div>
        </header>

        <nav className="admin-dashboard__nav" aria-label="Secciones del panel">
          <Link to="/admin/cocina" className="admin-dashboard__nav-link admin-dashboard__nav-link--active" aria-current="page">Cocina</Link>
          <Link to="/admin/pedidos" className="admin-dashboard__nav-link">Pedidos</Link>
        </nav>

        <section className="admin-kitchen" aria-label="Tablero de cocina">
          <div className="admin-kitchen__intro">
            <div>
              <span className="admin-kitchen__eyebrow">Vista de preparación</span>
              <h2>Cola de pedidos</h2>
              <p>Los pedidos nuevos aparecen automáticamente cada 10 segundos.</p>
            </div>
            <div className="admin-kitchen__totals" aria-live="polite">
              <span><strong>{groupedOrders.new.length}</strong> nuevos</span>
              <span><strong>{groupedOrders.preparing.length}</strong> preparando</span>
              <span><strong>{groupedOrders.ready.length}</strong> listos</span>
            </div>
          </div>

          {error && <div className="admin-kitchen__error" role="alert">{error}</div>}
          {loading ? (
            <div className="admin-kitchen__empty">Cargando pedidos…</div>
          ) : (
            <div className="admin-kitchen__board">
              {lanes.map((lane) => (
                <section className={`admin-kitchen__lane admin-kitchen__lane--${lane.id}`} key={lane.id} aria-labelledby={`kitchen-lane-${lane.id}`}>
                  <header className="admin-kitchen__lane-header">
                    <div>
                      <h3 id={`kitchen-lane-${lane.id}`}>{lane.title}</h3>
                      <p>{lane.helper}</p>
                    </div>
                    <span className="admin-kitchen__lane-count">{groupedOrders[lane.id].length}</span>
                  </header>

                  {groupedOrders[lane.id].length === 0 ? (
                    <div className="admin-kitchen__lane-empty">No hay pedidos acá.</div>
                  ) : (
                    <div className="admin-kitchen__cards">
                      {groupedOrders[lane.id].map((order) => (
                        <article className="admin-kitchen-card" key={order._id}>
                          <header className="admin-kitchen-card__header">
                            <div>
                              <span className="admin-kitchen-card__time">{getAgeLabel(order.createdAt)}</span>
                              <h4>Pedido #{order.orderNumber}</h4>
                            </div>
                            <span className="admin-kitchen-card__delivery">{getDeliveryLabel(order)}</span>
                          </header>

                          <div className="admin-kitchen-card__customer">
                            <strong>{order.customer.name}</strong>
                            <span>{getPaymentLabel(order)}</span>
                          </div>

                          <div className="admin-kitchen-card__items">
                            {order.items.map((item, itemIndex) => (
                              <section className="admin-kitchen-item" key={`${order._id}-${itemIndex}`}>
                                <h5><span>{item.quantity}×</span> {item.name}</h5>
                                {item.customization.size && (
                                  <p className="admin-kitchen-item__modifier">{item.customization.size.label}</p>
                                )}
                                {item.customization.choices?.map((choice, choiceIndex) => (
                                  <div className="admin-kitchen-item__choice" key={`${choice.groupId}-${choiceIndex}`}>
                                    <span>{choice.groupLabel}: <strong>{choice.optionLabel}</strong></span>
                                    {(choice.removedIngredients?.length ?? 0) > 0 && (
                                      <span className="admin-kitchen-item__remove">Sin {choice.removedIngredients?.join(", ")}</span>
                                    )}
                                  </div>
                                ))}
                                {(item.customization.removedIngredients?.length ?? 0) > 0 && (
                                  <p className="admin-kitchen-item__remove">Sin {item.customization.removedIngredients?.join(", ")}</p>
                                )}
                                {(item.customization.extras?.length ?? 0) > 0 && (
                                  <p className="admin-kitchen-item__modifier">Extras: {item.customization.extras?.map((extra) => extra.label).join(", ")}</p>
                                )}
                                {item.customization.notes && (
                                  <p className="admin-kitchen-item__note">{item.customization.notes}</p>
                                )}
                              </section>
                            ))}
                          </div>

                          {order.generalNotes && (
                            <div className="admin-kitchen-card__general-note">
                              <strong>Aclaración del pedido</strong>
                              <p>{order.generalNotes}</p>
                            </div>
                          )}

                          <footer className="admin-kitchen-card__footer">
                            <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} productos · {priceFormatter.format(order.total)}</span>
                            <Link to={`/admin/pedidos/${order._id}`}>Ver ficha</Link>
                          </footer>

                          <button
                            type="button"
                            className="admin-kitchen-card__action"
                            onClick={() => void handleAdvance(order, lane.id)}
                            disabled={updatingId !== null}
                          >
                            {updatingId === order._id ? "Guardando…" : getActionLabel(lane.id)}
                          </button>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}

          {!loading && activeOrders.length === 0 && !error && (
            <div className="admin-kitchen__all-clear">
              No hay pedidos pendientes de preparación. Los pedidos entregados y cancelados no aparecen en esta cola.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
