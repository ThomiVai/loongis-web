import "../styles/MenuSkeleton.css";

const SKELETON_CARDS = [
  1,
  2,
  3,
  4,
  5,
  6,
];

export function MenuSkeleton() {
  return (
    <div
      className="menu-skeleton"
      role="status"
      aria-live="polite"
      aria-label="Cargando productos"
    >
      <span className="menu-skeleton__sr-only">
        Cargando menú...
      </span>

      <div className="menu-skeleton__grid">
        {SKELETON_CARDS.map(
          (card) => (
            <article
              key={card}
              className="menu-skeleton-card"
              aria-hidden="true"
            >
              {/* =========================
                  IMAGEN
              ========================= */}

              <div className="menu-skeleton-card__image">
                <div className="menu-skeleton__shine" />
              </div>

              {/* =========================
                  CONTENIDO
              ========================= */}

              <div className="menu-skeleton-card__content">

                <div className="menu-skeleton-card__category">
                  <div className="menu-skeleton__shine" />
                </div>

                <div className="menu-skeleton-card__title">
                  <div className="menu-skeleton__shine" />
                </div>

                <div className="menu-skeleton-card__description">
                  <div className="menu-skeleton-card__line menu-skeleton-card__line--large">
                    <div className="menu-skeleton__shine" />
                  </div>

                  <div className="menu-skeleton-card__line menu-skeleton-card__line--medium">
                    <div className="menu-skeleton__shine" />
                  </div>

                  <div className="menu-skeleton-card__line menu-skeleton-card__line--small">
                    <div className="menu-skeleton__shine" />
                  </div>
                </div>

                {/* =========================
                    FOOTER
                ========================= */}

                <div className="menu-skeleton-card__footer">
                  <div className="menu-skeleton-card__price">
                    <div className="menu-skeleton__shine" />
                  </div>

                  <div className="menu-skeleton-card__actions">
                    <div className="menu-skeleton-card__button">
                      <div className="menu-skeleton__shine" />
                    </div>

                    <div className="menu-skeleton-card__button">
                      <div className="menu-skeleton__shine" />
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ),
        )}
      </div>
    </div>
  );
}