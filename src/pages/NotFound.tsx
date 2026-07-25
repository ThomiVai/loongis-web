import { FaArrowLeftLong, FaHouse } from "react-icons/fa6";
import { Link } from "react-router-dom";

import "../styles/NotFound.css";

export function NotFound() {
  return (
    <main className="not-found">
      <section
        className="not-found__content"
        aria-labelledby="not-found-title"
      >
        <span className="not-found__code">
          404
        </span>

        <div className="not-found__icon">
          <FaHouse aria-hidden="true" />
        </div>

        <h1
          className="not-found__title"
          id="not-found-title"
        >
          Esta página no está en el menú
        </h1>

        <p className="not-found__description">
          La dirección que ingresaste no existe o fue modificada.
          Podés volver al inicio o revisar las hamburguesas disponibles.
        </p>

        <div className="not-found__actions">
          <Link
            className="not-found__button not-found__button--primary"
            to="/"
          >
            <FaHouse aria-hidden="true" />

            <span>Volver al inicio</span>
          </Link>

          <Link
            className="not-found__button not-found__button--secondary"
            to="/menu"
          >
            <FaArrowLeftLong aria-hidden="true" />

            <span>Ver el menú</span>
          </Link>
        </div>
      </section>
    </main>
  );
}