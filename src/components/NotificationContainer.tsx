import {
  FaCheck,
  FaCircleInfo,
  FaTriangleExclamation,
  FaXmark,
} from "react-icons/fa6";

import { useNotification } from "../hooks/useNotification";

import "../styles/Notification.css";

export function NotificationContainer() {
  const {
    notifications,
    removeNotification,
  } = useNotification();

  return (
    <div
      className="notification-container"
      aria-live="polite"
      aria-atomic="false"
    >
      {notifications.map((notification) => (
        <div
          className={`notification notification--${notification.type}`}
          key={notification.id}
          role={
            notification.type === "error"
              ? "alert"
              : "status"
          }
        >
          <div className="notification__icon">
            {notification.type ===
              "success" && (
              <FaCheck aria-hidden="true" />
            )}

            {notification.type ===
              "info" && (
              <FaCircleInfo aria-hidden="true" />
            )}

            {notification.type ===
              "error" && (
              <FaTriangleExclamation
                aria-hidden="true"
              />
            )}
          </div>

          <p className="notification__message">
            {notification.message}
          </p>

          <button
            className="notification__close"
            type="button"
            aria-label="Cerrar notificación"
            onClick={() =>
              removeNotification(
                notification.id,
              )
            }
          >
            <FaXmark aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}