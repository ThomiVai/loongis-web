// sessionStorage retains retry identity in this tab; no customer data is stored here.
let memory:{fingerprint:string;key:string;expires:number}|undefined;
export async function getOrderRequestKey(data:unknown):Promise<string> {
 const bytes=new TextEncoder().encode(JSON.stringify(data));
 const hash=await crypto.subtle.digest('SHA-256',bytes);
 const fingerprint=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
 try {const raw=sessionStorage.getItem('loongis-order-attempt');if(raw){const parsed=JSON.parse(raw);if(typeof parsed?.fingerprint==='string'&&typeof parsed.key==='string'&&typeof parsed.expires==='number')memory=parsed;}}catch{/* In-memory retries remain available. */}
 if(!memory||memory.fingerprint!==fingerprint||memory.expires<Date.now()) {
  memory={fingerprint,key:crypto.randomUUID(),expires:Date.now()+8*60*60*1000};
  try{sessionStorage.setItem('loongis-order-attempt',JSON.stringify(memory));}catch{/* Session storage may be blocked. */}
 }
 return memory.key;
}
export function clearOrderAttempt(){memory=undefined;try{sessionStorage.removeItem('loongis-order-attempt');}catch{/* Optional storage. */}}
export type OrderReceipt={orderNumber:number;whatsappUrl:string;expires:number};
export function readOrderReceipt():OrderReceipt|null {
 try {const r=JSON.parse(sessionStorage.getItem('loongis-order-receipt')??'null') as OrderReceipt|null;
  return r&&Number.isInteger(r.orderNumber)&&r.orderNumber>0&&r.expires>Date.now()&&typeof r.whatsappUrl==='string'&&/^https:\/\/wa\.me\/\d+\?text=/.test(r.whatsappUrl)?r:null;
 }catch{return null;}
}
export function saveOrderReceipt(r:OrderReceipt){try{sessionStorage.setItem('loongis-order-receipt',JSON.stringify(r));}catch{/* Current screen still shows the receipt. */}}
export function clearOrderReceipt(){try{sessionStorage.removeItem('loongis-order-receipt');}catch{/* Optional storage. */}clearOrderAttempt();}
