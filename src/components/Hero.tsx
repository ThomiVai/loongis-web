import { useEffect, useRef } from "react";
import { FaArrowRight, FaCalendarDays, FaClock, FaLocationDot } from "react-icons/fa6";
import { Link } from "react-router-dom";

import "../styles/Hero.css";

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let wasPassed = false;
    const replay = () => {
      hero.classList.remove("hero--animate");
      void hero.offsetWidth;
      hero.classList.add("hero--animate");
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && entry.boundingClientRect.bottom < 0) wasPassed = true;
      if (entry.isIntersecting && wasPassed) {
        replay();
        wasPassed = false;
      }
    }, { threshold: 0.16 });

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="hero hero--animate" id="inicio" ref={heroRef}>
      <div className="hero__stage">
        <div className="hero__container">
          <div className="hero__content">
            <h1 className="hero__title">
              <span>Hamburguesas</span>
              <span>que te hacen</span>
              <span className="hero__title-accent">babear.</span>
            </h1>
            <p className="hero__description">Carne smash, ingredientes frescos y mucho amor en cada bocado.</p>
            <div className="hero__actions">
              <Link to="/menu" className="hero__button hero__button--primary"><span>Ver menú</span><FaArrowRight aria-hidden="true" /></Link>
              <Link to="/#combos" className="hero__button hero__button--secondary"><span>Promo del día</span><span aria-hidden="true">↓</span></Link>
            </div>
          </div>

          <div className="hero__visual" aria-hidden="true">
            <span className="hero__halo hero__halo--yellow" />
            <span className="hero__halo hero__halo--blue" />
            <span className="hero__sparkle hero__sparkle--one">✦</span>
            <span className="hero__sparkle hero__sparkle--two">✦</span>
            <span className="hero__floor" />
            <img className="hero__main-image" src="/images/hero/crispy-loongis.webp" width="420" height="698" fetchPriority="high" alt="" />
          </div>
        </div>
      </div>

      <div className="hero__benefits" aria-label="Beneficios de Loongis">
        <article className="hero__benefit"><FaClock aria-hidden="true" /><div><strong>Preparadas</strong><span>al momento</span></div></article>
        <article className="hero__benefit"><FaLocationDot aria-hidden="true" /><div><strong>Delivery</strong><span>en Hurlingham</span></div></article>
        <article className="hero__benefit"><FaCalendarDays aria-hidden="true" /><div><strong>Jueves a domingo</strong><span>20:00 a 00:00</span></div></article>
      </div>
    </section>
  );
}
