import {
  useEffect,
  useState,
} from "react";

import {
  getStoreStatus,
  updateStoreOrderMode,
  type StoreOrderMode,
  type StoreStatusData,
} from "../services/storeStatusApi";

import {
  getAdminToken,
} from "../utils/adminSession";

import "../styles/AdminStoreControl.css";

const orderModes: Array<{
  id: StoreOrderMode;
  label: string;
  description: string;
}> = [
  {
    id: "automatic",
    label: "Usar horario",
    description:
      "Abre y cierra automáticamente según el horario habitual.",
  },
  {
    id: "open",
    label: "Abrir pedidos",
    description:
      "Permite recibir pedidos ahora, incluso fuera del horario.",
  },
  {
    id: "paused",
    label: "Pausar pedidos",
    description:
      "Bloquea nuevos pedidos hasta cambiar nuevamente el modo.",
  },
];

export function AdminStoreControl() {
  const [
    status,
    setStatus,
  ] =
    useState<StoreStatusData | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    updatingMode,
    setUpdatingMode,
  ] =
    useState<StoreOrderMode | null>(
      null,
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    let mounted = true;

    async function loadStatus() {
      try {
        const currentStatus =
          await getStoreStatus();

        if (!mounted) {
          return;
        }

        setStatus(
          currentStatus,
        );
        setError(null);
      } catch (loadError) {
        if (!mounted) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el estado del local.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadStatus();

    return () => {
      mounted = false;
    };
  }, []);

  const handleModeChange =
    async (
      orderMode: StoreOrderMode,
    ) => {
      const token =
        getAdminToken();

      if (!token) {
        setError(
          "La sesión expiró. Volvé a iniciar sesión.",
        );

        return;
      }

      setUpdatingMode(
        orderMode,
      );
      setError(null);

      try {
        const updatedStatus =
          await updateStoreOrderMode(
            orderMode,
            token,
          );

        setStatus(
          updatedStatus,
        );
      } catch (updateError) {
        setError(
          updateError instanceof Error
            ? updateError.message
            : "No se pudo actualizar el estado del local.",
        );
      } finally {
        setUpdatingMode(null);
      }
    };

  return (
    <section
      className="admin-store-control"
      aria-labelledby="admin-store-control-title"
    >
      <header className="admin-store-control__header">
        <div>
          <span className="admin-store-control__eyebrow">
            Operación
          </span>

          <h2 id="admin-store-control-title">
            Recepción de pedidos
          </h2>

          <p>
            Controlá si la tienda puede
            registrar nuevos pedidos.
          </p>
        </div>

        {status && (
          <div
            className={`admin-store-control__current admin-store-control__current--${status.state}`}
            role="status"
            aria-live="polite"
          >
            <span aria-hidden="true" />

            <div>
              <strong>
                {status.statusLabel}
              </strong>

              <small>
                {status.detailLabel}
              </small>
            </div>
          </div>
        )}
      </header>

      {loading && (
        <p className="admin-store-control__message">
          Cargando estado del local...
        </p>
      )}

      {error && (
        <p
          className="admin-store-control__error"
          role="alert"
        >
          {error}
        </p>
      )}

      {!loading && status && (
        <div className="admin-store-control__modes">
          {orderModes.map(
            (mode) => {
              const isActive =
                status.orderMode ===
                mode.id;

              const isUpdating =
                updatingMode ===
                mode.id;

              return (
                <button
                  className={`admin-store-mode ${isActive ? "admin-store-mode--active" : ""} admin-store-mode--${mode.id}`}
                  type="button"
                  key={mode.id}
                  aria-pressed={
                    isActive
                  }
                  disabled={
                    updatingMode !==
                      null ||
                    isActive
                  }
                  onClick={() =>
                    void handleModeChange(
                      mode.id,
                    )
                  }
                >
                  <strong>
                    {isUpdating
                      ? "Actualizando..."
                      : mode.label}
                  </strong>

                  <span>
                    {mode.description}
                  </span>
                </button>
              );
            },
          )}
        </div>
      )}

      <p className="admin-store-control__schedule">
        Horario habitual: jueves a
        domingo, de 20:00 a 00:00.
      </p>
    </section>
  );
}
