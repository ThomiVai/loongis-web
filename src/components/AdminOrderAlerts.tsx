import { useEffect, useRef, useState } from "react";
import { getAdminOrders } from "../services/adminOrdersApi";
import "../styles/AdminOrderAlerts.css";

type AdminOrderAlertsProps = { token: string };

export function AdminOrderAlerts({ token }: AdminOrderAlertsProps) {
  const [pending, setPending] = useState<number | null>(null);
  const [fresh, setFresh] = useState(0);
  const [failed, setFailed] = useState(false);
  const [sound, setSound] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const enabled = useRef(false);

  const playTone = (frequency: number, startAt: number, duration: number) => {
    const context = audio.current;
    if (!context || context.state !== "running") return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.045, startAt + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  };

  const beep = () => {
    const context = audio.current;
    if (!context || context.state !== "running") return;
    playTone(660, context.currentTime, 0.13);
    playTone(880, context.currentTime + 0.16, 0.17);
  };

  async function toggleSound() {
    if (enabled.current) {
      enabled.current = false;
      setSound(false);
      return;
    }
    try {
      audio.current ??= new AudioContext();
      await audio.current.resume();
      if (audio.current.state !== "running") throw new Error("Audio no disponible");
      enabled.current = true;
      setSound(true);
      setAudioError(false);
      beep();
    } catch {
      setAudioError(true);
    }
  }

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    let ready = false;
    const seen = new Set<string>();

    async function poll() {
      try {
        const orders = await getAdminOrders(token, "pending");
        if (stopped) return;
        const newOrders = orders.filter((order) => !seen.has(order._id));
        orders.forEach((order) => seen.add(order._id));
        setPending(orders.length);
        setFailed(false);
        if (ready && newOrders.length > 0) {
          setFresh((count) => count + newOrders.length);
          if (enabled.current) beep();
        }
        ready = true;
      } catch {
        if (!stopped) setFailed(true);
      } finally {
        if (!stopped) timer = setTimeout(() => void poll(), 10000);
      }
    }

    void poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [token]);

  useEffect(() => () => {
    void audio.current?.close();
    audio.current = null;
  }, []);

  return (
    <aside className={`admin-order-alerts${pending !== null && pending > 0 ? " admin-order-alerts--pending" : ""}`} aria-label="Avisos de pedidos">
      <div className="admin-order-alerts__inner">
        <div className="admin-order-alerts__status" role="status" aria-live="polite">
          <span className="admin-order-alerts__indicator" aria-hidden="true" />
          <div>
            <strong>{failed ? "Avisos sin actualizar" : pending === null ? "Conectando pedidos" : `${pending} pedidos pendientes`}</strong>
            <span>{failed ? "Revisá la conexión y tu sesión." : fresh > 0 ? `${fresh} nuevos desde que abriste el panel` : "El panel se actualiza automáticamente cada 10 segundos."}</span>
          </div>
        </div>
        <div className="admin-order-alerts__actions">
          <button
            type="button"
            className={`admin-order-alerts__sound${sound ? " admin-order-alerts__sound--on" : ""}`}
            onClick={() => void toggleSound()}
            aria-pressed={sound}
            aria-label={sound ? "Silenciar avisos sonoros" : "Activar avisos sonoros"}
            title={audioError ? "No se pudo activar el audio en este navegador" : undefined}
          >
            <span aria-hidden="true">{sound ? "♫" : "♪"}</span>
            {audioError ? "Audio no disponible" : sound ? "Sonido activado" : "Activar sonido"}
          </button>
        </div>
      </div>
    </aside>
  );
}
