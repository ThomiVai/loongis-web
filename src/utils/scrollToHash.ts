/* ========================================
   SCROLL A HASH
======================================== */

export function scrollToHash(
  hash: string,
  behavior: ScrollBehavior = "smooth",
): boolean {
  if (!hash) {
    return false;
  }

  const elementId =
    decodeURIComponent(
      hash.replace(/^#/, ""),
    );

  if (!elementId) {
    return false;
  }

  const targetElement =
    document.getElementById(
      elementId,
    );

  if (!targetElement) {
    return false;
  }

  /* ========================================
     POSICIÓN EXACTA DE LA SECCIÓN
  ======================================== */

  const targetTop =
    targetElement
      .getBoundingClientRect()
      .top +
    window.scrollY;

  window.scrollTo({
    top: targetTop,
    left: 0,
    behavior,
  });

  return true;
}