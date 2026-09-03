import {
  FaClock,
  FaPause,
  FaStore,
} from "react-icons/fa6";

import { useStoreStatus } from "../hooks/useStoreStatus";

import "../styles/StoreStatus.css";

export function StoreStatus() {
  const {
    isOpen,
    statusLabel,
    detailLabel,
    state,
  } = useStoreStatus();

  return (
    <aside
      className={`store-status store-status--${state}`}
      aria-label="Estado del local"
    >
      <div className="store-status__container">
        <div className="store-status__information">
          <div className="store-status__icon">
            {isOpen ? (
              <FaStore aria-hidden="true" />
            ) : state ===
              "paused" ? (
              <FaPause aria-hidden="true" />
            ) : (
              <FaClock aria-hidden="true" />
            )}
          </div>

          <div className="store-status__text">
            <strong>
              <span
                className="store-status__indicator"
                aria-hidden="true"
              />

              {statusLabel}
            </strong>

            <span>{detailLabel}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
