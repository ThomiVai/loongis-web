import {
  useEffect,
} from "react";

import {
  useLocation,
} from "react-router-dom";

import {
  scrollToHash,
} from "../utils/scrollToHash";

export function ScrollToTop() {
  const {
    pathname,
    hash,
  } = useLocation();

  useEffect(() => {
    let observer:
      MutationObserver | null =
      null;

    let observerTimeout:
      number | null = null;

    const animationFrame =
      window.requestAnimationFrame(
        () => {
          /* =================================
             NAVEGACIÓN CON HASH
          ================================= */

          if (hash) {
            const targetFound =
              scrollToHash(
                hash,
                "smooth",
              );

            /*
              Puede pasar que vengamos desde
              /menu, /carrito, /producto...

              Home ya cambió de ruta, pero
              algunas secciones todavía no
              existen porque los productos
              están cargando desde la API.

              En ese caso esperamos a que
              aparezca el elemento.
            */

            if (!targetFound) {
              observer =
                new MutationObserver(
                  () => {
                    const found =
                      scrollToHash(
                        hash,
                        "smooth",
                      );

                    if (found) {
                      observer?.disconnect();

                      observer = null;

                      if (
                        observerTimeout !==
                        null
                      ) {
                        window.clearTimeout(
                          observerTimeout,
                        );
                      }
                    }
                  },
                );

              observer.observe(
                document.body,
                {
                  childList: true,
                  subtree: true,
                },
              );

              /*
                Evitamos dejar un observer
                vivo indefinidamente si
                alguien escribe un hash que
                no existe.
              */

              observerTimeout =
                window.setTimeout(
                  () => {
                    observer?.disconnect();

                    observer = null;
                  },
                  60000,
                );
            }

            return;
          }

          /* =================================
             NAVEGACIÓN NORMAL
          ================================= */

          window.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto",
          });
        },
      );

    return () => {
      window.cancelAnimationFrame(
        animationFrame,
      );

      observer?.disconnect();

      if (
        observerTimeout !== null
      ) {
        window.clearTimeout(
          observerTimeout,
        );
      }
    };
  }, [
    pathname,
    hash,
  ]);

  return null;
}