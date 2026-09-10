import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminOrders } from "../services/adminOrdersApi";
import "../styles/AdminOrderAlerts.css";
export function AdminOrderAlerts({token}:{token:string}) {
 const [pending,setPending]=useState<number|null>(null);const [fresh,setFresh]=useState(0);const [failed,setFailed]=useState(false);const [sound,setSound]=useState(false);const [audioError,setAudioError]=useState(false);
 const audio=useRef<AudioContext|null>(null);const enabled=useRef(false);
 const beep=()=>{const context=audio.current;if(!context||context.state!=='running')return;const oscillator=context.createOscillator();const gain=context.createGain();oscillator.connect(gain);gain.connect(context.destination);oscillator.frequency.value=880;gain.gain.setValueAtTime(.08,context.currentTime);gain.gain.exponentialRampToValueAtTime(.001,context.currentTime+.3);oscillator.start();oscillator.stop(context.currentTime+.3);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};};
 async function toggleSound() {
  if(enabled.current){enabled.current=false;setSound(false);return;}
  try {audio.current??=new AudioContext();await audio.current.resume();if(audio.current.state!=='running')throw new Error();enabled.current=true;setSound(true);setAudioError(false);beep();}catch{setAudioError(true);}
 }
 useEffect(()=>{
  let stopped=false;let timer:ReturnType<typeof setTimeout>;let ready=false;const seen=new Set<string>();
  async function poll(){
   try {const orders=await getAdminOrders(token,'pending');if(stopped)return;const newOnes=orders.filter(o=>!seen.has(o._id));orders.forEach(o=>seen.add(o._id));setPending(orders.length);setFailed(false);
    if(ready&&newOnes.length){setFresh(n=>n+newOnes.length);if(enabled.current)beep();}
    ready=true;
   }catch{if(!stopped)setFailed(true);}finally{if(!stopped)timer=setTimeout(()=>void poll(),20000);}
  }
  void poll();return()=>{stopped=true;clearTimeout(timer);};
 },[token]);
 useEffect(()=>()=>{void audio.current?.close();audio.current=null;},[]);
 return <aside className="admin-order-alerts" aria-label="Avisos de pedidos"><div role="status" aria-live="polite">{failed?'No pudimos actualizar los avisos. Revisá la conexión y la sesión.':pending===null?'Consultando pedidos…':`${pending} pedidos pendientes`}{fresh>0&&` · ${fresh} nuevos desde que abriste el panel`}</div><Link to="/admin/pedidos" onClick={()=>setFresh(0)}>Ver pedidos</Link><Link to="/admin/ventas">Ventas</Link><button type="button" onClick={()=>void toggleSound()}>{sound?'Silenciar aviso':'Activar aviso sonoro'}</button><small>Actualiza cada 20 s con el panel abierto. El navegador puede pausar los avisos en segundo plano.{audioError?' No se pudo activar el audio en este navegador.':''}</small></aside>;
}
