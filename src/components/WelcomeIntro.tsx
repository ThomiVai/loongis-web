import { useEffect, useState } from "react";
import "../styles/WelcomeIntro.css";

import { SESSION_KEY } from "../services/welcomeIntro";

export function WelcomeIntro({ onComplete }: { onComplete: () => void }) {
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    const finishTimer = window.setTimeout(() => setFinishing(true), 4500);
    const exitTimer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch { /* The intro also works when browser storage is unavailable. */ }
      onComplete();
    }, 5000);
    return () => {
      window.clearTimeout(finishTimer);
      window.clearTimeout(exitTimer);
    };
  }, [onComplete]);

  return (
    <div className={`welcome-intro${finishing ? " welcome-intro--leaving" : ""}`} role="status" aria-live="polite">
      <img className="welcome-intro__logo" src="/images/logos/loongis-logo-transparent.png" alt="Loongis" />
      <img className="welcome-intro__chef" src="/images/logos/loongis-chef-intro.png" alt="Mascota cocinera de Loongis" />
      <h1>{finishing ? "Ya sale tu Loongis…" : "Estamos calentando la plancha…"}</h1>
      <div className="welcome-intro__dots" aria-hidden="true"><span /><span /><span /></div>
      <p>Hechas al momento. Con mucho amor.</p>
    </div>
  );
}
