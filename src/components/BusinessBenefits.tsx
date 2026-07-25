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

function BreadIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M14 28c0-10 8-17 18-17s18 7 18 17v18H14V28Z" />

      <path d="M22 22c2 3 2 6 0 9" />
      <path d="M32 18c2 4 2 8 0 12" />
      <path d="M42 22c2 3 2 6 0 9" />

      <path d="M14 39h36" />
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

function HappyIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="22" />

      <circle
        className="business-benefit__icon-dot"
        cx="24"
        cy="27"
        r="1.8"
      />

      <circle
        className="business-benefit__icon-dot"
        cx="40"
        cy="27"
        r="1.8"
      />

      <path d="M22 38c3 5 7 7 10 7s7-2 10-7" />
    </svg>
  );
}

const benefits: Benefit[] = [
  {
    id: 1,
    title: "Carne 100%",
    description: "de verdad",
    icon: <MeatIcon />,
  },
  {
    id: 2,
    title: "Pan artesanal",
    description: "todos los días",
    icon: <BreadIcon />,
  },
  {
    id: 3,
    title: "Envíos rápidos",
    description: "a todo el barrio",
    icon: <DeliveryIcon />,
  },
  {
    id: 4,
    title: "Miles de clientes",
    description: "felices",
    icon: <HappyIcon />,
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