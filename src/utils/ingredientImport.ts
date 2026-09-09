import type { AdminIngredient, CreateAdminIngredientData } from "../services/adminInventoryApi";
export const importHeaders = ["nombre", "unidad", "stock_inicial", "stock_minimo", "stock_objetivo", "costo_unitario", "presentacion", "unidades_por_presentacion", "categoria", "ubicacion", "controlar_vencimientos"];
const slug = (s:string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const units: Record<string,CreateAdminIngredientData["unit"]> = {unidad:"unit",unit:"unit",porcion:"portion",portion:"portion",gramo:"gram",g:"gram",gram:"gram",kilogramo:"kilogram",kg:"kilogram",kilogram:"kilogram",mililitro:"milliliter",ml:"milliliter",milliliter:"milliliter",litro:"liter",l:"liter",liter:"liter"};
export function parseDelimited(text: string): string[][] {
  text = text.replace(/^\uFEFF/, "");
  const first = text.split(/\r?\n/,1)[0];
  const delimiter = first.includes("\t") ? "\t" : first.includes(";") ? ";" : ",";
  const rows:string[][]=[]; let row:string[]=[]; let cell=""; let quoted=false; let closed=false;
  for(let i=0;i<text.length;i++) {
    const ch=text[i];
    if(quoted) {if(ch==='"') {if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=ch;continue;}
    if(ch===delimiter || ch==='\n' || ch==='\r') {
      row.push(cell.trim());cell="";closed=false;
      if(ch!==delimiter) {if(ch==='\r' && text[i+1]==='\n')i++;if(row.some(Boolean))rows.push(row);row=[];}
    } else if(ch==='"' && !cell && !closed) quoted=true;
    else {if(closed && ch.trim()) throw new Error("Hay texto después de una celda entre comillas.");cell+=ch;}
  }
  if(quoted) throw new Error("Hay comillas sin cerrar en el archivo.");
  row.push(cell.trim());if(row.some(Boolean))rows.push(row);return rows;
}
export function parseIngredientImport(text:string, existing:AdminIngredient[]) {
  const csv=parseDelimited(text);const header=csv.shift();
  if(!header || header.join("|")!==importHeaders.join("|")) throw new Error("Usá los encabezados y el orden de la plantilla descargable.");
  if(!csv.length || csv.length>200)throw new Error("Cargá entre 1 y 200 insumos.");
  const errors:string[]=[];const rows:CreateAdminIngredientData[]=[];const seen=new Set(existing.map(i=>slug(i.name)));
  csv.forEach((cells,index)=>{
    try {
      if(cells.length!==importHeaders.length)throw new Error("La cantidad de columnas no coincide con la plantilla.");
      const [name,rawUnit,stock,min,target,cost,label,factor,category,location,expiration]=cells;
      if(name.length<2 || name.length>100 || !slug(name))throw new Error("Nombre inválido.");
      if(seen.has(slug(name)))throw new Error(`El insumo «${name}» ya existe o está repetido.`);
      seen.add(slug(name));
      const unit=units[slug(rawUnit)];if(!unit)throw new Error("Unidad inválida. Usá unidad, porcion, gramo, kilogramo, mililitro o litro.");
      const num=(v:string,label:string,positive=false)=>{
        if(!/^\d+(?:[.,]\d+)?$/.test(v))throw new Error(`${label}: completá un número sin separador de miles.`);
        const n=Number(v.replace(",","."));if(!Number.isFinite(n)||n>1e12||(positive&&n<0.000001))throw new Error(`${label}: valor fuera de rango.`);return n;
      };
      if(!["si","no"].includes(slug(expiration)))throw new Error("Controlar vencimientos: escribí si o no.");
      if(label.length>60||category.length>60||location.length>80)throw new Error("Presentación, categoría o ubicación demasiado largas.");
      rows.push({name,unit,stock:num(stock,"Stock inicial"),minimumStock:num(min,"Mínimo"),targetStock:num(target,"Objetivo"),unitCost:num(cost,"Costo"),purchaseUnitLabel:label,purchaseUnitFactor:num(factor,"Equivalencia",true),category,storageLocation:location,trackExpiration:slug(expiration)==="si",active:true,order:0});
    }catch(e){errors.push(`Fila ${index+2}: ${(e as Error).message}`);}
  });
  return {rows,errors};
}
export function downloadText(name:string,text:string) {
 const url=URL.createObjectURL(new Blob(["\uFEFF",text],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
