import {
  useEffect,
  useState,
} from "react";

import {
  FaArrowRightLong,
  FaXmark,
} from "react-icons/fa6";

import { Link } from "react-router-dom";

import "../styles/FloatingLoongis.css";

export function FloatingLoongis() {
  const [
    isVisible,
    setIsVisible,
  ] = useState(false);

  const [
    isBubbleOpen,
    setIsBubbleOpen,
  ] = useState(false);

  useEffect(() => {
    let animationFrame = 0;

    const handleScroll = () => {
      cancelAnimationFrame(
        animationFrame,
      );

      animationFrame =
        requestAnimationFrame(() => {
          const scrollableHeight =
            document.documentElement
              .scrollHeight -
            window.innerHeight;

          if (
            scrollableHeight <= 0
          ) {
            setIsVisible(false);

            return;
          }

          const progress =
            window.scrollY /
            scrollableHeight;

          /*
            No aparece en el Hero.

            Entra cuando el usuario ya empezó
            a recorrer el Home y desaparece
            antes del final para no molestar
            al Footer / StoreInfo.
          */

          const shouldBeVisible =
            progress > 0.13 &&
            progress < 0.87;

          setIsVisible(
            shouldBeVisible,
          );

          if (!shouldBeVisible) {
            setIsBubbleOpen(
              false,
            );
          }
        });
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "resize",
      handleScroll,
    );

    return () => {
      cancelAnimationFrame(
        animationFrame,
      );

      window.removeEventListener(
        "scroll",
        handleScroll,
      );

      window.removeEventListener(
        "resize",
        handleScroll,
      );
    };
  }, []);

  return (
    <aside
      className={[
        "floating-loongis",
        isVisible
          ? "floating-loongis--visible"
          : "",
      ].join(" ")}
      aria-label="Mascota de Loongis"
    >
      {/* ========================================
          BURBUJA
      ======================================== */}

      <div
        className={[
          "floating-loongis__bubble",
          isBubbleOpen
            ? "floating-loongis__bubble--visible"
            : "",
        ].join(" ")}
      >
        <button
          className="floating-loongis__close"
          type="button"
          aria-label="Cerrar mensaje"
          onClick={() =>
            setIsBubbleOpen(
              false,
            )
          }
        >
          <FaXmark
            aria-hidden="true"
          />
        </button>

        <span className="floating-loongis__eyebrow">
          Loongis recomienda
        </span>

        <strong className="floating-loongis__title">
          ¿Ya elegiste tu favorita?
        </strong>

        <Link
          className="floating-loongis__link"
          to="/menu"
        >
          <span>
            Ver el menú
          </span>

          <FaArrowRightLong
            aria-hidden="true"
          />
        </Link>
      </div>

      {/* ========================================
          MASCOTA
      ======================================== */}

      <button
        className="floating-loongis__mascot"
        type="button"
        aria-label={
          isBubbleOpen
            ? "Cerrar recomendación de Loongis"
            : "Ver recomendación de Loongis"
        }
        aria-expanded={
          isBubbleOpen
        }
        onClick={() =>
          setIsBubbleOpen(
            (
              currentValue,
            ) =>
              !currentValue,
          )
        }
      >
        <span
          className="floating-loongis__spark floating-loongis__spark--one"
          aria-hidden="true"
        >
          ✦
        </span>

        <span
          className="floating-loongis__spark floating-loongis__spark--two"
          aria-hidden="true"
        >
          ✦
        </span>

        <img
          className="floating-loongis__image"
          src="/mascot/loongis-floating.png"
          alt=""
        />
      </button>
    </aside>
  );
}