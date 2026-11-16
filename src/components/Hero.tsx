import { useEffect, useRef, useState } from "react";
import { FaCalendarDays, FaClock, FaLocationDot } from "react-icons/fa6";
import { Link } from "react-router-dom";

import "../styles/Hero.css";

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let wasPassed = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && entry.boundingClientRect.bottom < 0) {
        wasPassed = true;
        return;
      }

      if (entry.isIntersecting && wasPassed) {
        setAnimationKey((key) => key + 1);
        wasPassed = false;
      }
    }, { threshold: [0, 0.28] });

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="hero" id="inicio" ref={heroRef}>
      <div className="hero__reference-container">
        <article className="hero-poster">
          <div className="hero-stage-product" key={animationKey}>
            <h1 className="hero-accessible-title">
              Loongis: hamburguesas que te hacen babear
            </h1>

            <div className="product-hero-inner">
              <div className="product-hero-copy">
                <div className="product-hero-title" aria-hidden="true">
                  <span className="product-title-line product-title-line-1">Hamburguesas</span>
                  <span className="product-title-line product-title-line-2">que te hacen</span>
                  <span className="product-title-line product-title-line-3">babear.</span>
                </div>

                <p className="product-hero-description">
                  Carne smash, ingredientes frescos y mucho amor en cada bocado.
                </p>

                <div className="product-hero-actions">
                  <Link className="hero-menu-button" to="/menu">Ver menú</Link>
                  <Link className="hero-promo-button" to="/#combos">Promo del día</Link>
                </div>
              </div>

              <div className="product-hero-visual" aria-hidden="true">
                <span className="product-sparkle product-sparkle-one">✦</span>
                <span className="product-sparkle product-sparkle-two">✦</span>
                <div className="product-shot">
                  <img
                    src="/images/hero/crispy-loongis.png"
                    width="1233"
                    height="2048"
                    fetchPriority="high"
                    alt=""
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="hero-deck">
            <div className="hero-deck-copy" />
            <div className="hero-benefits" aria-label="Beneficios">
              <span className="benefit">
                <FaClock className="benefit-icon" aria-hidden="true" />
                <span className="benefit-copy"><strong>Preparadas</strong><small>al momento</small></span>
              </span>
              <span className="benefit">
                <FaLocationDot className="benefit-icon" aria-hidden="true" />
                <span className="benefit-copy"><strong>Delivery</strong><small>en Hurlingham</small></span>
              </span>
              <span className="benefit">
                <FaCalendarDays className="benefit-icon" aria-hidden="true" />
                <span className="benefit-copy"><strong>Jueves a domingo</strong><small>20:00 a 00:00</small></span>
              </span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
