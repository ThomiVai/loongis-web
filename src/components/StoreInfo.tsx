import type { ReactNode } from "react";

import "../styles/StoreInfo.css";

type StoreInfoItem = {
  id: number;
  title: string;
  description: ReactNode;
  actionText: string;
  icon: ReactNode;
};

function ClockIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="34" r="22" />

      <path d="M32 21v14l9 5" />

      <path d="M24 8h16" />
      <path d="M32 8v4" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 56s18-16 18-31C50 15 42 8 32 8s-18 7-18 17c0 15 18 31 18 31Z" />

      <circle cx="32" cy="25" r="6" />
    </svg>
  );
}

function DeliveryIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M12 39h7l5-16h20l8 16h3" />

      <path d="M29 23v16" />
      <path d="M29 31h17" />

      <path d="M25 23 21 15h11" />

      <circle cx="21" cy="45" r="6" />
      <circle cx="49" cy="45" r="6" />

      <path d="M7 28h9" />
      <path d="M4 34h11" />
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

const storeInfoItems: StoreInfoItem[] = [
  {
    id: 1,
    title: "Horarios",
    description: (
      <>
        Jueves a domingo
        <strong>19:00 a 00:00 hs</strong>
      </>
    ),
    actionText: "Ver horarios",
    icon: <ClockIcon />,
  },
  {
    id: 2,
    title: "Encontranos",
    description: (
      <>
        Hurlingham, Buenos Aires
        <strong>Retiro por el local</strong>
      </>
    ),
    actionText: "Cómo llegar",
    icon: <LocationIcon />,
  },
  {
    id: 3,
    title: "Envíos",
    description: (
      <>
        Llegamos a tu zona
        <strong>Consultá la cobertura</strong>
      </>
    ),
    actionText: "Ver zonas",
    icon: <DeliveryIcon />,
  },
];

export function StoreInfo() {
  return (
    <section
      className="store-info"
      id="contacto"
      aria-labelledby="store-info-title"
    >
      <div className="store-info__container">
        <div className="store-info__heading">
          <span className="store-info__eyebrow">
            Estamos cerca
          </span>

          <h2
            className="store-info__title"
            id="store-info-title"
          >
            Todo lo que necesitás saber
          </h2>

          <p className="store-info__subtitle">
            Consultá nuestros horarios, ubicación y zonas de entrega.
          </p>
        </div>

        <div className="store-info__grid">
          {storeInfoItems.map((item) => (
            <article
              className="store-info-card"
              key={item.id}
            >
              <div
                className="store-info-card__icon"
                aria-hidden="true"
              >
                {item.icon}
              </div>

              <div className="store-info-card__content">
                <h3 className="store-info-card__title">
                  {item.title}
                </h3>

                <p className="store-info-card__description">
                  {item.description}
                </p>

                <button
                  className="store-info-card__action"
                  type="button"
                >
                  <span>{item.actionText}</span>

                  <ArrowIcon />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}