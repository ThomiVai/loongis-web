import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminToken } from '../utils/adminSession';
import '../styles/AdminSales.css';
type Report = { from: string; to: string; sales: number; orders: number; averageTicket: number; days: { date: string; sales: number; orders: number }[] };
const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
function preset(days: number) {
  const to = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date());
  const from = new Date(new Date(to + 'T12:00:00Z').getTime() - (days - 1) * 86400000).toISOString().slice(0, 10);
  return { from, to };
}
export function AdminSales() {
  const [range, setRange] = useState(() => preset(30));
  const [query, setQuery] = useState(range);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/api/orders/sales?${new URLSearchParams(query)}`, { headers: { Authorization: `Bearer ${getAdminToken()}` }, signal: controller.signal })
      .then(async response => { const body = await response.json(); if (!response.ok || !body.success) throw new Error(body.message ?? 'No se pudieron consultar las ventas.'); return body.data as Report; })
      .then(data => { if (!controller.signal.aborted) setReport(data); })
      .catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'No se pudieron consultar las ventas.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [query]);
  function load(next: typeof range) { setRange(next); setReport(null); setError(''); setLoading(true); setQuery({ ...next }); }
  const max = Math.max(1, ...report?.days.map(day => day.sales) ?? []);
  return <main className="sales-page">
    <Link to="/admin/pedidos">← Volver a pedidos</Link>
    <h1>Ventas</h1><p>Seguí la evolución de los pedidos confirmados.</p>
    <div className="sales-presets">{[7,30,90].map(days => <button key={days} type="button" onClick={() => load(preset(days))}>Últimos {days} días</button>)}</div>
    <form className="sales-filters" onSubmit={event => { event.preventDefault(); load(range); }}>
      <label>Desde<input type="date" required value={range.from} max={range.to} onChange={e => setRange({ ...range, from: e.target.value })} /></label>
      <label>Hasta<input type="date" required value={range.to} min={range.from} onChange={e => setRange({ ...range, to: e.target.value })} /></label>
      <button type="submit">Consultar ventas</button>
    </form>
    <p className="sales-note">Solo pedidos actualmente confirmados, agrupados por fecha de creación en horario argentino. Importes de productos en pesos; no incluyen envío. No representa cobros verificados ni ganancia. Si cancelás un pedido, deja de sumar en su fecha original.</p>
    {loading && <p role="status">Consultando ventas…</p>}
    {error && <p role="alert">{error} <button onClick={() => load(query)}>Reintentar</button></p>}
    {report && <>
      <p>Período consultado: {report.from.split('-').reverse().join('/')} al {report.to.split('-').reverse().join('/')}</p>
      <div className="sales-metrics"><article><h2>Venta de productos</h2><strong>{money.format(report.sales)}</strong></article><article><h2>Pedidos confirmados</h2><strong>{report.orders}</strong></article><article><h2>Ticket promedio</h2><strong>{money.format(report.averageTicket)}</strong></article></div>
      <section className="sales-chart"><h2>Ventas por día</h2>
        {!report.orders ? <p>No hay pedidos confirmados en este período.</p> : <>
          <p>Escala máxima: {money.format(max)}. Consultá los importes exactos en el detalle diario.</p>
          <svg viewBox="0 0 720 240" role="img" aria-label="Gráfico de ventas diarias. Los valores exactos están en el detalle diario debajo.">
            {[0,1,2,3].map(i => <line key={i} x1="12" x2="708" y1={20+i*60} y2={20+i*60} stroke="#d5deeb" />)}
            {report.days.map((day,i) => { const width = 696 / report.days.length; const height = day.sales / max * 180; return <rect key={day.date} x={12+i*width+width*.12} y={200-height} width={width*.76} height={height} rx="2" fill="#075fea"><title>{day.date}: {money.format(day.sales)} · {day.orders} pedidos</title></rect>; })}
            <text x="12" y="228" fontSize="14" fill="#17263d">{report.from.split('-').reverse().join('/')}</text><text x="708" y="228" textAnchor="end" fontSize="14" fill="#17263d">{report.to.split('-').reverse().join('/')}</text>
          </svg>
        </>}
        <details><summary>Ver detalle diario</summary><table><caption>Ventas y pedidos por día</caption><thead><tr><th scope="col">Fecha</th><th scope="col">Pedidos</th><th scope="col">Productos</th></tr></thead><tbody>{report.days.map(day => <tr key={day.date}><th scope="row">{day.date.split('-').reverse().join('/')}</th><td>{day.orders}</td><td>{money.format(day.sales)}</td></tr>)}</tbody></table></details>
      </section>
    </>}
  </main>;
}
