import "../styles/HomeCatalogSkeletons.css";

/* ========================================
   BLOQUE BASE
======================================== */

function SkeletonBlock({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span
      className={`home-skeleton__block ${className}`}
      aria-hidden="true"
    >
      <span className="home-skeleton__shine" />
    </span>
  );
}

/* ========================================
   PROMO DEL DÍA
======================================== */

export function DailyPromoSkeleton() {
  return (
    <section
      className="promo-banner home-skeleton-promo"
      id="combos"
      aria-label="Cargando promo del día"
      aria-busy="true"
    >
      <span className="home-skeleton__sr-only">
        Cargando promo del día...
      </span>

      <div className="promo-banner__container">

        {/* =============================
            VISUAL
        ============================= */}

        <div className="home-skeleton-promo__visual">
          <SkeletonBlock className="home-skeleton-promo__image" />

          <SkeletonBlock className="home-skeleton-promo__badge" />
        </div>

        {/* =============================
            CONTENIDO
        ============================= */}

        <div className="home-skeleton-promo__content">
          <SkeletonBlock className="home-skeleton-promo__eyebrow" />

          <SkeletonBlock className="home-skeleton-promo__title" />

          <SkeletonBlock className="home-skeleton-promo__name" />

          <div className="home-skeleton-promo__description">
            <SkeletonBlock />
            <SkeletonBlock />
            <SkeletonBlock className="home-skeleton-promo__description-short" />
          </div>

          <div className="home-skeleton-promo__list">
            <SkeletonBlock />
            <SkeletonBlock />
            <SkeletonBlock />
          </div>

          <SkeletonBlock className="home-skeleton-promo__price" />

          <div className="home-skeleton-promo__actions">
            <SkeletonBlock />
            <SkeletonBlock />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================
   COMBOS
======================================== */

export function BurgerCombosSkeleton() {
  return (
    <section
      className="burger-combos home-skeleton-combos"
      id="combos-loongis"
      aria-label="Cargando combos Loongis"
      aria-busy="true"
    >
      <span className="home-skeleton__sr-only">
        Cargando combos...
      </span>

      <div className="burger-combos__container">

        {/* =============================
            HEADER
        ============================= */}

        <header className="home-skeleton-combos__header">
          <div className="home-skeleton-combos__heading">
            <SkeletonBlock className="home-skeleton-combos__eyebrow" />

            <SkeletonBlock className="home-skeleton-combos__title" />

            <SkeletonBlock className="home-skeleton-combos__description" />
          </div>

          <SkeletonBlock className="home-skeleton-combos__menu-link" />
        </header>

        {/* =============================
            CARDS
        ============================= */}

        <div className="home-skeleton-combos__grid">
          {[1, 2].map(
            (item) => (
              <article
                className="home-skeleton-combo-card"
                key={item}
                aria-hidden="true"
              >
                <SkeletonBlock className="home-skeleton-combo-card__image" />

                <div className="home-skeleton-combo-card__content">
                  <SkeletonBlock className="home-skeleton-combo-card__name" />

                  <div className="home-skeleton-combo-card__description">
                    <SkeletonBlock />
                    <SkeletonBlock />
                  </div>

                  <div className="home-skeleton-combo-card__footer">
                    <SkeletonBlock className="home-skeleton-combo-card__price" />

                    <SkeletonBlock className="home-skeleton-combo-card__button" />
                  </div>
                </div>
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

/* ========================================
   DESTACADAS
======================================== */

export function FeaturedProductsSkeleton() {
  return (
    <section
      className="featured-products home-skeleton-featured"
      id="destacadas"
      aria-label="Cargando productos destacados"
      aria-busy="true"
    >
      <span className="home-skeleton__sr-only">
        Cargando productos destacados...
      </span>

      <div className="featured-products__container">

        {/* =============================
            HEADER
        ============================= */}

        <header className="home-skeleton-featured__header">
          <SkeletonBlock className="home-skeleton-featured__line" />

          <SkeletonBlock className="home-skeleton-featured__heading" />

          <SkeletonBlock className="home-skeleton-featured__line" />
        </header>

        {/* =============================
            CARDS
        ============================= */}

        <div className="home-skeleton-featured__grid">
          {[1, 2, 3].map(
            (item) => (
              <article
                className="home-skeleton-featured-card"
                key={item}
                aria-hidden="true"
              >
                <SkeletonBlock className="home-skeleton-featured-card__image" />

                <div className="home-skeleton-featured-card__content">
                  <SkeletonBlock className="home-skeleton-featured-card__name" />

                  <div className="home-skeleton-featured-card__description">
                    <SkeletonBlock />
                    <SkeletonBlock />
                  </div>

                  <div className="home-skeleton-featured-card__footer">
                    <SkeletonBlock className="home-skeleton-featured-card__price" />

                    <SkeletonBlock className="home-skeleton-featured-card__button" />
                  </div>
                </div>
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  );
}