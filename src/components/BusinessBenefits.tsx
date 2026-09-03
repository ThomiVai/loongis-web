import type { ReactNode } from "react";

import "../styles/BusinessBenefits.css";

type Benefit = {
  id: number;
  title: string;
  description: string;
  icon: ReactNode;
};

function MeatIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M8 34c0-10 9-19 22-22 11-3 22 0 27 8 5 8 1 19-8 26-10 8-25 10-34 4-5-3-7-9-7-16Z" />

      <path d="M31 22c7-3 15-2 19 3 4 5 2 11-3 15-6 5-15 6-21 2-6-4-6-11-1-16 2-2 4-3 6-4Z" />

      <path d="M15 36c3 1 6 4 8 8" />

      <circle
        className="business-benefit__icon-dot"
        cx="41"
        cy="30"
        r="2.4"
      />
    </svg>
  );
}

function FriesIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M15 25h34l-4 29H19l-4-29Z" />
      <path d="M21 25 19 10h7l2 15" />
      <path d="M30 25V7h7v18" />
      <path d="m40 25 3-15 7 2-4 15" />
      <path d="M20 35h25" />
    </svg>
  );
}

function DeliveryIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M10 38h8l5-15h19l8 15h4" />

      <path d="M26 23 22 15h10" />

      <path d="M29 23v15" />
      <path d="M29 31h17" />

      <circle cx="20" cy="43" r="6" />
      <circle cx="48" cy="43" r="6" />

      <path d="M8 27h8" />
      <path d="M5 33h10" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="22" />
      <path d="M32 18v15l10 6" />
      <path d="M25 6h14" />
      <path d="M32 6v4" />
    </svg>
  );
}

const benefits: Benefit[] = [
  {
    id: 1,
    title: "Smash dobles",
    description: "con opción simple",
    icon: <MeatIcon />,
  },
  {
    id: 2,
    title: "Papas incluidas",
    description: "con cada burger",
    icon: <FriesIcon />,
  },
  {
    id: 3,
    title: "Hechas al momento",
    description: "para cada pedido",
    icon: <ClockIcon />,
  },
  {
    id: 4,
    title: "Solo delivery",
    description: "en Hurlingham",
    icon: <DeliveryIcon />,
  },
];

export function BusinessBenefits() {
  return (
    <section
      className="business-benefits"
      id="nosotros"
      aria-label="Beneficios de Loongis"
    >
      <div className="business-benefits__container">
        <div className="business-benefits__grid">
          {benefits.map((benefit) => (
            <article
              className="business-benefit"
              key={benefit.id}
            >
              <div
                className="business-benefit__icon"
                aria-hidden="true"
              >
                {benefit.icon}
              </div>

              <div className="business-benefit__content">
                <h3 className="business-benefit__title">
                  {benefit.title}
                </h3>

                <p className="business-benefit__description">
                  {benefit.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
