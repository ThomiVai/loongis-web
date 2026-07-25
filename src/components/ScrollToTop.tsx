import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      if (hash) {
        const elementId = decodeURIComponent(
          hash.replace("#", ""),
        );

        const targetElement =
          document.getElementById(elementId);

        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

          return;
        }
      }

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [pathname, hash, key]);

  return null;
}