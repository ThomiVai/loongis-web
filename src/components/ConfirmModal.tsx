import {
  useEffect,
  useId,
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
  const panelReference =
    useRef<HTMLDivElement>(null);

  const cancelButtonReference =
    useRef<HTMLButtonElement>(null);

  const previousFocusReference =
    useRef<HTMLElement | null>(null);

  const onCancelReference =
    useRef(onCancel);

  const titleId =
    useId();

  const messageId =
    useId();

  /* ========================================
     MANTENER CALLBACK ACTUALIZADO
  ======================================== */

  useEffect(() => {
    onCancelReference.current =
      onCancel;
  }, [onCancel]);

  /* ========================================
     ACCESIBILIDAD DEL MODAL
  ======================================== */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    /*
      Guardamos el elemento que tenía
      el foco antes de abrir el modal.

      Al cerrarlo, devolveremos el foco
      a ese mismo elemento.
    */
    previousFocusReference.current =
      document.activeElement instanceof
      HTMLElement
        ? document.activeElement
        : null;

    const previousBodyOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    /*
      En una acción destructiva como
      "Vaciar pedido", ponemos el foco
      inicialmente en Cancelar.
    */
    requestAnimationFrame(() => {
      cancelButtonReference.current?.focus();
    });

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      /* ========================================
         ESCAPE
      ======================================== */

      if (event.key === "Escape") {
        event.preventDefault();

        onCancelReference.current();

        return;
      }

      /* ========================================
         TRAMPA DE FOCO
      ======================================== */

      if (event.key !== "Tab") {
        return;
      }

      const panel =
        panelReference.current;

      if (!panel) {
        return;
      }

      const focusableElements =
        Array.from(
          panel.querySelectorAll<HTMLElement>(
            `
              button:not([disabled]),
              a[href],
              input:not([disabled]),
              select:not([disabled]),
              textarea:not([disabled]),
              [tabindex]:not([tabindex="-1"])
            `,
          ),
        );

      if (
        focusableElements.length === 0
      ) {
        event.preventDefault();

        return;
      }

      const firstElement =
        focusableElements[0];

      const lastElement =
        focusableElements[
          focusableElements.length - 1
        ];

      const activeElement =
        document.activeElement;

      /*
        SHIFT + TAB desde el primero
        vuelve al último.
      */
      if (
        event.shiftKey &&
        activeElement === firstElement
      ) {
        event.preventDefault();

        lastElement.focus();

        return;
      }

      /*
        TAB desde el último
        vuelve al primero.
      */
      if (
        !event.shiftKey &&
        activeElement === lastElement
      ) {
        event.preventDefault();

        firstElement.focus();
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

      /*
        Devolvemos el foco al botón
        que abrió el modal.
      */
      requestAnimationFrame(() => {
        previousFocusReference.current?.focus();
      });
    };
  }, [isOpen]);

  /* ========================================
     MODAL CERRADO
  ======================================== */

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="confirm-modal"
      role="presentation"
      onMouseDown={
        onCancel
      }
    >
      <div
        ref={
          panelReference
        }
        className="confirm-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={
          titleId
        }
        aria-describedby={
          messageId
        }
        onMouseDown={(
          event,
        ) =>
          event.stopPropagation()
        }
      >
        {/* ========================================
            CERRAR
        ======================================== */}

        <button
          className="confirm-modal__close"
          type="button"
          aria-label="Cerrar ventana de confirmación"
          onClick={
            onCancel
          }
        >
          <FaXmark
            aria-hidden="true"
          />
        </button>

        {/* ========================================
            ICONO
        ======================================== */}

        <div
          className={`confirm-modal__icon ${
            danger
              ? "confirm-modal__icon--danger"
              : ""
          }`}
          aria-hidden="true"
        >
          <FaTriangleExclamation />
        </div>

        {/* ========================================
            CONTENIDO
        ======================================== */}

        <h2
          className="confirm-modal__title"
          id={
            titleId
          }
        >
          {title}
        </h2>

        <p
          className="confirm-modal__message"
          id={
            messageId
          }
        >
          {message}
        </p>

        {/* ========================================
            ACCIONES
        ======================================== */}

        <div className="confirm-modal__actions">
          <button
            ref={
              cancelButtonReference
            }
            className="confirm-modal__button confirm-modal__button--cancel"
            type="button"
            onClick={
              onCancel
            }
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
            onClick={
              onConfirm
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}