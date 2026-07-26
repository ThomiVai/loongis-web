import {
  useEffect,
  useRef,
} from "react";
import {
  FaTriangleExclamation,
  FaXmark,
} from "react-icons/fa6";

import "../styles/ConfirmModal.css";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const cancelButtonReference =
    useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousBodyOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    cancelButtonReference.current?.focus();

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousBodyOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="confirm-modal"
      role="presentation"
      onMouseDown={onCancel}
    >
      <div
        className="confirm-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <button
          className="confirm-modal__close"
          type="button"
          aria-label="Cerrar"
          onClick={onCancel}
        >
          <FaXmark aria-hidden="true" />
        </button>

        <div
          className={`confirm-modal__icon ${
            danger
              ? "confirm-modal__icon--danger"
              : ""
          }`}
        >
          <FaTriangleExclamation
            aria-hidden="true"
          />
        </div>

        <h2
          className="confirm-modal__title"
          id="confirm-modal-title"
        >
          {title}
        </h2>

        <p
          className="confirm-modal__message"
          id="confirm-modal-message"
        >
          {message}
        </p>

        <div className="confirm-modal__actions">
          <button
            ref={cancelButtonReference}
            className="confirm-modal__button confirm-modal__button--cancel"
            type="button"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>

          <button
            className={`confirm-modal__button ${
              danger
                ? "confirm-modal__button--danger"
                : "confirm-modal__button--confirm"
            }`}
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}