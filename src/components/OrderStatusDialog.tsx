import { useEffect, useRef, useState } from "react";
import type { AdminOrder } from "../services/adminOrdersApi";
import "../styles/OrderStatusDialog.css";

type Props = { order: AdminOrder; status: "confirmed" | "cancelled"; busy: boolean; error: string | null; onClose: () => void; onConfirm: (restore: boolean, reason: string) => void };
export function OrderStatusDialog({ order, status, busy, error, onClose, onConfirm }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [inventory, setInventory] = useState("");
  const [reason, setReason] = useState("");
  const cancelling = status === "cancelled";
  const needsInventory = cancelling && order.status === "confirmed" && order.inventoryTrackingStatus === "deducted";
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    element?.showModal();
    return () => { element?.close(); previous?.focus(); };
  }, []);
  return <dialog ref={dialog} className="order-dialog" aria-labelledby="order-dialog-title" aria-describedby="order-dialog-description" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <form onSubmit={event => { event.preventDefault(); if (!busy && (!needsInventory || inventory)) onConfirm(needsInventory && inventory === "restore", reason.trim()); }}>
      <h2 id="order-dialog-title">{cancelling ? "Cancelar" : "Confirmar"} pedido #{order.orderNumber}</h2>
      <p id="order-dialog-description">{cancelling ? "El pedido quedará cancelado y no se contará como venta. Revisá los datos antes de continuar." : "Si el control de stock está activo, se descontarán los insumos según las recetas configuradas."}</p>
      {needsInventory && <fieldset disabled={busy}><legend>¿Se utilizaron los insumos?</legend>
        <label><input type="radio" name="inventory" value="keep" required checked={inventory === "keep"} onChange={() => setInventory("keep")} /> Sí, la comida ya se preparó. Mantener el consumo.</label>
        <label><input type="radio" name="inventory" value="restore" required checked={inventory === "restore"} onChange={() => setInventory("restore")} /> No se utilizaron. Reintegrar al stock.</label>
      </fieldset>}
      {cancelling && !needsInventory && <p>Este pedido no tiene stock descontado para reintegrar.</p>}
      {cancelling && <label className="order-dialog__reason">Motivo (opcional)<textarea maxLength={500} value={reason} disabled={busy} onChange={event => setReason(event.target.value)} rows={3} /></label>}
      {error && <p role="alert" className="order-dialog__error">{error}</p>}
      <div className="order-dialog__actions"><button type="button" autoFocus disabled={busy} onClick={onClose}>Volver sin cambios</button><button type="submit" className={cancelling ? "order-dialog__danger" : "order-dialog__confirm"} disabled={busy || (needsInventory && !inventory)}>{busy ? "Guardando…" : cancelling ? "Sí, cancelar pedido" : "Sí, confirmar pedido"}</button></div>
    </form>
  </dialog>;
}
