import type { ReactNode } from "react";

import "../styles/Categories.css";

type Category = {
  id: number;
  name: string;
  icon: ReactNode;
};

function BurgerIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M12 27c1.5-9.5 9.2-15 20-15s18.5 5.5 20 15H12Z" />

      <path d="M10 31h44" />

      <path d="M13 35h38l-4 6H17l-4-6Z" />

      <path d="M15 45h34c2.8 0 5 2.2 5 5v1H10v-1c0-2.8 2.2-5 5-5Z" />

      <circle className="category-icon__dot" cx="24" cy="19" r="1.2" />
      <circle className="category-icon__dot" cx="32" cy="17" r="1.2" />
      <circle className="category-icon__dot" cx="40" cy="20" r="1.2" />
    </svg>
  );
}

function FriesIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M20 28 16 11l6-1 4 18" />
      <path d="M27 28 25 8l6-.5 2 20.5" />
      <path d="M34 28 35 7.5l6 .5-1 20" />
      <path d="M41 28 47 10l6 2-6 18" />

      <path d="M18 27h31l-4 27H22l-4-27Z" />

      <path d="M26 38h15" />
      <path d="M28 43h11" />
    </svg>
  );
}

function DrinkIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="m39 9 7-6" />
      <path d="M38 10 34 23" />

      <path d="M20 20h27" />
      <path d="M17 25h33" />

      <path d="M21 25 24 53h19l3-28" />

      <path d="M27 35h14" />
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

      <circle className="category-icon__dot" cx="14" cy="29" r="0.9" />
      <circle className="category-icon__dot" cx="21" cy="28" r="0.9" />

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
    icon: <BurgerIcon />,
  },
  {
    id: 2,
    name: "Papas",
    icon: <FriesIcon />,
  },
  {
    id: 3,
    name: "Bebidas",
    icon: <DrinkIcon />,
  },
  {
    id: 4,
    name: "Combos",
    icon: <ComboIcon />,
  },
  {
    id: 5,
    name: "Más pedidas",
    icon: <FlameIcon />,
  },
];

export function Categories() {
  return (
    <section
      className="categories"
      aria-label="Categorías del menú"
    >
      <div className="categories__container">
        <div className="categories__list">
          {categories.map((category) => (
            <button
              className="category-card"
              type="button"
              key={category.id}
              aria-label={`Ver categoría ${category.name}`}
            >
              <span
                className="category-card__icon"
                aria-hidden="true"
              >
                {category.icon}
              </span>

              <span className="category-card__bottom">
                <span className="category-card__name">
                  {category.name}
                </span>

                <span className="category-card__arrow">
                  <ArrowIcon />
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}