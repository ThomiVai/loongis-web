import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import "../styles/Categories.css";

type Category = {
  id: number;
  name: string;
  description: string;
  icon: ReactNode;
  destination: string;
  type: "route" | "anchor";
};

function BurgerIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M12 27c1.5-9.5 9.2-15 20-15s18.5 5.5 20 15H12Z" />

      <path d="M10 31h44" />

      <path d="M13 35h38l-4 6H17l-4-6Z" />

      <path d="M15 45h34c2.8 0 5 2.2 5 5v1H10v-1c0-2.8 2.2-5 5-5Z" />

      <circle
        className="category-icon__dot"
        cx="24"
        cy="19"
        r="1.2"
      />

      <circle
        className="category-icon__dot"
        cx="32"
        cy="17"
        r="1.2"
      />

      <circle
        className="category-icon__dot"
        cx="40"
        cy="20"
        r="1.2"
      />
    </svg>
  );
}

function ComboIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M5 34c1-6 6-10 13-10s12 4 13 10H5Z" />

      <path d="M4 38h28" />

      <path d="M7 42h22l-3 5H10l-3-5Z" />

      <path d="M8 50h20c2 0 4 2 4 4H4c0-2 2-4 4-4Z" />

      <circle
        className="category-icon__dot"
        cx="14"
        cy="29"
        r="0.9"
      />

      <circle
        className="category-icon__dot"
        cx="21"
        cy="28"
        r="0.9"
      />

      <path d="M39 28 37 13l4-1 3 16" />

      <path d="M45 28V10h5v18" />

      <path d="m51 28 4-15 5 2-5 15" />

      <path d="M36 28h24l-3 24H40l-4-24Z" />

      <path d="M42 38h11" />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M34 7c3 10-5 13-5 22 0 3 2 6 5 7-1-6 5-9 8-14 8 7 12 14 12 22 0 12-9 19-22 19S10 56 10 44c0-10 6-18 15-27 0 8 3 12 6 14-1-8 5-14 3-24Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13" />

      <path d="m14 7 5 5-5 5" />
    </svg>
  );
}

const categories: Category[] = [
  {
    id: 1,
    name: "Hamburguesas",
    description: "Todas nuestras smash",
    icon: <BurgerIcon />,
    destination: "/menu?categoria=hamburguesas",
    type: "route",
  },
  {
  id: 2,
  name: "Combos",
  description: "Burger, papas y bebida",
  icon: <ComboIcon />,
  destination: "#combos-loongis",
  type: "anchor",
},
  {
    id: 3,
    name: "Más elegidas",
    description: "Las favoritas de todos",
    icon: <FlameIcon />,
    destination: "#destacadas",
    type: "anchor",
  },
];

function CategoryCardContent({
  category,
}: {
  category: Category;
}) {
  return (
    <>
      <span
        className="category-card__icon"
        aria-hidden="true"
      >
        {category.icon}
      </span>

      <span className="category-card__content">
        <strong className="category-card__name">
          {category.name}
        </strong>

        <small className="category-card__description">
          {category.description}
        </small>
      </span>

      <span
        className="category-card__arrow"
        aria-hidden="true"
      >
        <ArrowIcon />
      </span>
    </>
  );
}

export function Categories() {
  return (
    <section
      className="categories"
      aria-labelledby="categories-title"
    >
      <div className="categories__container">
        <header className="categories__header">
          <span className="categories__eyebrow">
            Encontrá tu favorita
          </span>

          <h2
            className="categories__title"
            id="categories-title"
          >
            ¿Qué estás buscando?
          </h2>
        </header>

        <div className="categories__list">
          {categories.map((category) => {
            if (category.type === "route") {
              return (
                <Link
                  className="category-card"
                  to={category.destination}
                  key={category.id}
                  aria-label={`Ver ${category.name}`}
                >
                  <CategoryCardContent
                    category={category}
                  />
                </Link>
              );
            }

            return (
              <a
                className="category-card"
                href={category.destination}
                key={category.id}
                aria-label={`Ir a ${category.name}`}
              >
                <CategoryCardContent
                  category={category}
                />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}