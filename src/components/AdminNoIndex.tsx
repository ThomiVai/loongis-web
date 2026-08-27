import {
  useEffect,
} from "react";

export function AdminNoIndex() {
  useEffect(() => {
    const existingMeta =
      document.querySelector<HTMLMetaElement>(
        'meta[name="robots"]',
      );

    const hadExistingMeta =
      Boolean(existingMeta);

    const previousContent =
      existingMeta?.getAttribute(
        "content",
      ) ?? null;

    const meta =
      existingMeta ??
      document.createElement(
        "meta",
      );

    if (!existingMeta) {
      meta.setAttribute(
        "name",
        "robots",
      );

      document.head.appendChild(
        meta,
      );
    }

    meta.setAttribute(
      "content",
      "noindex, nofollow, noarchive",
    );

    return () => {
      if (hadExistingMeta) {
        if (
          previousContent === null
        ) {
          meta.removeAttribute(
            "content",
          );
        } else {
          meta.setAttribute(
            "content",
            previousContent,
          );
        }

        return;
      }

      meta.remove();
    };
  }, []);

  return null;
}