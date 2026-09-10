import { useState } from "react";
import { saveIngredientBatch } from "../services/adminInventoryApi";
import type { AdminIngredient, CreateAdminIngredientData } from "../services/adminInventoryApi";
import { downloadText, importHeaders, parseIngredientImport } from "../utils/ingredientImport";
import "../styles/IngredientBatchTools.css";

type Props={token:string;ingredients:AdminIngredient[];onSaved:()=>Promise<void>};
type EditRow={id:string;updatedAt:string;name:string;minimumStock:string;targetStock:string;unitCost:string;purchaseUnitFactor:string;purchaseUnitLabel:string;category:string;storageLocation:string};
const fields=[['minimumStock','Mínimo'],['targetStock','Objetivo'],['unitCost','Costo por unidad'],['purchaseUnitFactor','Unidades por presentación'],['purchaseUnitLabel','Presentación'],['category','Categoría'],['storageLocation','Ubicación']] as const;
const unitLabels={unit:'Unidad',portion:'Porción',gram:'Gramo',kilogram:'Kilogramo',milliliter:'Mililitro',liter:'Litro'};
const numericFields=new Set(['minimumStock','targetStock','unitCost','purchaseUnitFactor']);
export function IngredientBatchTools({token,ingredients,onSaved}:Props) {
 const [mode,setMode]=useState<'import'|'edit'|null>(null);const [text,setText]=useState('');const [rows,setRows]=useState<CreateAdminIngredientData[]>([]);const [errors,setErrors]=useState<string[]>([]);
 const [edits,setEdits]=useState<EditRow[]>([]);const [baseline,setBaseline]=useState<Record<string,string>>({});const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 const preview=()=>{setRows([]);setMessage('');try{const r=parseIngredientImport(text,ingredients);setRows(r.rows);setErrors(r.errors);}catch(e){setErrors([(e as Error).message]);}};
 const startEdit=()=>{const values=ingredients.map(i=>({id:i._id,updatedAt:i.updatedAt??'',name:i.name,minimumStock:String(i.minimumStock),targetStock:String(i.targetStock),unitCost:String(i.unitCost),purchaseUnitFactor:String(i.purchaseUnitFactor),purchaseUnitLabel:i.purchaseUnitLabel??'',category:i.category??'',storageLocation:i.storageLocation??''}));setEdits(values);setBaseline(Object.fromEntries(values.map(r=>[r.id,JSON.stringify(r)])));setMode('edit');setErrors([]);setMessage('');};
 const changed=edits.filter(r=>JSON.stringify(r)!==baseline[r.id]);
 async function save(kind:'import'|'batch') {
  if(busy)return;
  if(!window.confirm(kind==='import'?`¿Crear ${rows.length} insumos y registrar sus existencias iniciales?`:`¿Guardar los cambios de ${changed.length} insumos?`))return;
  setBusy(true);setErrors([]);setMessage('');
  let saved=false;
  try {
   const values=kind==='import'?rows:changed.map(r=>({...r,...Object.fromEntries(fields.filter(([key])=>numericFields.has(key)).map(([key])=>{
    if(!/^\d+(?:[.,]\d+)?$/.test(r[key]))throw new Error(`${r.name}: completá los valores numéricos sin separadores de miles.`);
    const value=Number(r[key].replace(',','.'));if(!Number.isFinite(value)||value>1e12||(key==='purchaseUnitFactor'&&value<0.000001))throw new Error(`${r.name}: equivalencia o número inválido.`);return [key,value];
   }))}));
   const result=await saveIngredientBatch(token,values,kind);saved=true;setRows([]);setText('');setMode(null);setEdits([]);setMessage(`${result.count} insumos guardados.`);await onSaved();
  } catch(e){setErrors([saved?'Los cambios se guardaron, pero no se pudo actualizar la vista. Usá Actualizar antes de continuar.':(e as Error).message]);}finally{setBusy(false);}
 }
 return <section className="ingredient-batch" aria-label="Carga y edición masiva de insumos">
  <h3>Cargar y editar en conjunto</h3><p>Importá insumos nuevos o editá la configuración de los existentes. El stock actual se corrige desde movimientos o conteos.</p>
  <div className="ingredient-batch__actions"><button disabled={busy} onClick={()=>{setMode('import');setErrors([]);setMessage('');}}>Importar planilla</button><button disabled={busy||!ingredients.length||ingredients.length>200} onClick={startEdit}>Editar en tabla</button></div>
  {message&&<p role="status">{message}</p>}{errors.length>0&&<div role="alert"><strong>Revisá antes de guardar:</strong><ul>{errors.map((e,i)=><li key={i}>{e}</li>)}</ul></div>}
  {mode==='import'&&<div>
   <p>Descargá la plantilla y abrila en Excel o Google Sheets. Guardala como CSV UTF-8 separado por punto y coma o coma, o pegá las celdas con sus encabezados. Máximo: 200 filas y 1 MB. Usá decimales sin separadores de miles. Completá los números; cero debe ser una decisión explícita.</p>
   <button disabled={busy} onClick={()=>downloadText('plantilla-insumos.csv',importHeaders.join(';')+'\r\n')}>Descargar plantilla CSV</button>
   <label>Archivo CSV<input disabled={busy} type="file" accept=".csv,.tsv,text/csv,text/tab-separated-values" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;setRows([]);setText('');setErrors([]);if(file.size>1_000_000){setErrors(['El archivo supera 1 MB.']);return;}try{setText(await file.text());}catch{setErrors(['No se pudo leer el archivo.']);}}}/></label>
   <label>O pegá la planilla<textarea disabled={busy} rows={6} value={text} onChange={e=>{setText(e.target.value);setRows([]);setErrors([]);}}/></label>
   <p>Si necesitás cargar vencimientos por lote, importá el insumo con stock inicial cero y después registrá las entregas con sus lotes y fechas.</p>
   <button disabled={busy||!text.trim()} onClick={preview}>Revisar importación</button>
   {rows.length>0&&<><p>{rows.length} filas válidas. {errors.length?'Corregí todos los errores para poder importar.':'Revisá unidades, cantidades y costos antes de confirmar.'}</p><div className="ingredient-batch__scroll"><table><thead><tr><th>Insumo</th><th>Unidad</th><th>Inicial</th><th>Mínimo</th><th>Objetivo</th><th>Costo</th><th>Presentación</th><th>Equivale a</th><th>Categoría</th><th>Ubicación</th><th>Vencimientos</th></tr></thead><tbody>{rows.map((r,i)=><tr key={i}><th scope="row">{r.name}</th><td data-label="Unidad">{unitLabels[r.unit]}</td><td data-label="Inicial">{r.stock}</td><td data-label="Mínimo">{r.minimumStock}</td><td data-label="Objetivo">{r.targetStock}</td><td data-label="Costo">{r.unitCost}</td><td data-label="Presentación">{r.purchaseUnitLabel || '—'}</td><td data-label="Equivale a">{r.purchaseUnitFactor}</td><td data-label="Categoría">{r.category || '—'}</td><td data-label="Ubicación">{r.storageLocation || '—'}</td><td data-label="Vencimientos">{r.trackExpiration?'Sí':'No'}</td></tr>)}</tbody></table></div><button disabled={busy||errors.length>0} onClick={()=>void save('import')}>Confirmar importación</button></>}
  </div>}
  {mode==='edit'&&<><p>Las unidades base y las existencias no cambian desde esta tabla. Se guardarán todas las filas modificadas juntas.</p><div className="ingredient-batch__scroll"><table><thead><tr><th>Insumo</th>{fields.map(([key,label])=><th key={key}>{label}</th>)}</tr></thead><tbody>{edits.map((r,index)=><tr key={r.id}><th scope="row">{r.name}</th>{fields.map(([key,label])=><td key={key} data-label={label}><input aria-label={`${r.name}: ${label}`} disabled={busy} inputMode={numericFields.has(key)?'decimal':undefined} value={r[key]} onChange={e=>setEdits(current=>current.map((v,i)=>i===index?{...v,[key]:e.target.value}:v))}/></td>)}</tr>)}</tbody></table></div><button disabled={busy||!changed.length} onClick={()=>void save('batch')}>Guardar {changed.length} insumos modificados</button></>}
  {mode&&<button disabled={busy} onClick={()=>{setMode(null);setRows([]);setErrors([]);}}>Cerrar sin guardar</button>}
 </section>;
}
