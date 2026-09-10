import { test, expect } from '@playwright/test';
const order = { _id:'test-order', orderNumber:123, customer:{name:'Cliente de prueba',phone:'1100000000',address:'Dirección de prueba'},deliveryMethod:'delivery',paymentMethod:'cash',items:[],productsTotal:1000,deliveryCost:null,total:1000,status:'confirmed',inventoryTrackingStatus:'deducted',generalNotes:'',createdAt:'2026-09-10T12:00:00Z' };
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem('loongis_admin_token','fixture-only'));
 await page.route('**/api/**',async route=>{const path=new URL(route.request().url()).pathname;const data=path==='/api/auth/me'?{id:'fixture',email:'prueba@example.test',role:'owner'}:path==='/api/orders/test-order'?order:[];await route.fulfill({json:{success:true,data}});});
 page.on('dialog',()=>{throw new Error('No debe abrir diálogos nativos del navegador');});
});
test('cancelar permite volver y Escape sin enviar cambios',async({page})=>{
 let writes=0;page.on('request',r=>{if(r.method()==='PATCH')writes++;});
 await page.goto('/admin/pedidos/test-order');await page.getByRole('button',{name:'Cancelar pedido confirmado',exact:true}).click();
 const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();await expect(dialog.getByRole('button',{name:'Sí, cancelar pedido'})).toBeDisabled();
 await dialog.getByRole('button',{name:'Volver sin cambios'}).click();await expect(dialog).toHaveCount(0);
 await page.getByRole('button',{name:'Cancelar pedido confirmado',exact:true}).click();await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);expect(writes).toBe(0);
});
for(const restore of [true,false])test(`cancelación guarda elección explícita de stock: ${restore}`,async({page},info)=>{
 let payload:Record<string,unknown>|undefined;
 await page.route('**/api/orders/test-order/status',async route=>{payload=route.request().postDataJSON();await route.fulfill({json:{success:true,data:{...order,status:'cancelled',inventoryTrackingStatus:restore?'reversed':'kept_as_waste',cancellationReason:payload?.reason}}});});
 await page.goto('/admin/pedidos/test-order');await page.getByRole('button',{name:'Cancelar pedido confirmado',exact:true}).click();
 const dialog=page.getByRole('dialog');await dialog.getByRole('radio',{name:restore?'No se utilizaron. Reintegrar al stock.':'Sí, la comida ya se preparó. Mantener el consumo.'}).check();await dialog.getByLabel('Motivo (opcional)').fill('Prueba aislada');
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
 if(restore)await dialog.screenshot({path:info.outputPath('cancelacion-pedido.png')});
 await dialog.getByRole('button',{name:'Sí, cancelar pedido'}).click();await expect(page.getByText('Pedido cancelado correctamente.',{exact:true})).toBeVisible();expect(payload).toEqual({status:'cancelled',restoreInventory:restore,reason:'Prueba aislada'});
 await expect(page.getByText(restore?'El stock fue reintegrado.':'El consumo se mantuvo porque los insumos ya se utilizaron.',{exact:true})).toBeVisible();
});
test('un error conserva motivo y permite reintentar sin cerrar el diálogo',async({page})=>{
 await page.route('**/api/orders/test-order/status',route=>route.fulfill({status:409,json:{success:false,message:'El pedido cambió. Actualizá antes de continuar.'}}));
 await page.goto('/admin/pedidos/test-order');await page.getByRole('button',{name:'Cancelar pedido confirmado',exact:true}).click();const dialog=page.getByRole('dialog');await dialog.getByRole('radio',{name:'No se utilizaron. Reintegrar al stock.'}).check();await dialog.getByLabel('Motivo (opcional)').fill('Conservar este motivo');await dialog.getByRole('button',{name:'Sí, cancelar pedido'}).click();await expect(dialog.getByRole('alert')).toContainText('El pedido cambió');await expect(dialog.getByLabel('Motivo (opcional)')).toHaveValue('Conservar este motivo');
});
test('ventas muestra métricas, detalle accesible y período sin ventas',async({page},info)=>{
 let empty=false;
 await page.route('**/api/orders/sales?*',async route=>{const q=new URL(route.request().url()).searchParams;const from=q.get('from'),to=q.get('to');await route.fulfill({json:{success:true,data:{from,to,sales:empty?0:3000,orders:empty?0:2,averageTicket:empty?0:1500,days:[{date:from,sales:empty?0:3000,orders:empty?0:2},{date:to,sales:0,orders:0}]}}});});
 await page.goto('/admin/ventas');await expect(page.getByRole('heading',{name:'Venta de productos'})).toBeVisible();await page.getByText('Ver detalle diario',{exact:true}).click();await expect(page.getByRole('table')).toContainText('3.000');await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);await page.locator('.sales-page').screenshot({path:info.outputPath('ventas.png')});
 empty=true;await page.getByRole('button',{name:'Últimos 7 días'}).click();await expect(page.getByText('No hay pedidos confirmados en este período.')).toBeVisible();
});
test('recorrido de combo a comprobante conserva personalización y evita otro pedido al volver',async({page},info)=>{
 const options=[{id:'queso',label:'Solo Queso',kind:'burger',productLegacyId:1,sizeId:'simple',ingredients:['Queso','Tomate']}];
 const product={_id:'combo-test',legacyId:102,name:'Combo de 3 Simples',slug:'combo-prueba',description:'Tres simples con papas',price:21000,image:'/test.jpg',imageAlt:'Combo de prueba',category:{_id:'c',name:'Combos',slug:'combos',active:true,order:1},active:true,order:1,featured:false,sizes:[],extras:[],ingredients:[],choiceGroups:[1,2,3].map(n=>({id:`hamburguesa-${n}`,label:`Hamburguesa ${n}`,options}))};
 let writes=0;let payload: { items: { customization: { choices: { removedIngredients:string[] }[] } }[]; requestKey: string }|undefined;
 await page.route('**/api/products',route=>route.fulfill({json:{success:true,data:[product]}}));
 await page.route('**/api/products/102',route=>route.fulfill({json:{success:true,data:product}}));
 await page.route('**/api/store/status',route=>route.fulfill({json:{success:true,data:{canOrder:true,scheduleOpen:true,state:'open',statusLabel:'Abierto',detailLabel:'Prueba',orderMode:'open'}}}));
 await page.route('https://wa.me/**',route=>route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:'<!doctype html><meta charset="utf-8"><p>WhatsApp simulado - sin mensajes enviados</p>'}));
 await page.route('**/api/orders',async route=>{
  if(route.request().method()!=='POST'){await route.fulfill({json:{success:true,data:[]}});return;}
  writes++;payload=route.request().postDataJSON();
  await route.fulfill({json:{success:true,data:{...order,...payload,status:'pending',orderNumber:456,productsTotal:21000,total:21000,items:[{legacyId:102,name:product.name,quantity:1,unitPrice:21000,lineTotal:21000,customization:{extras:[],removedIngredients:[],notes:'',choices:[{groupId:'hamburguesa-1',groupLabel:'Hamburguesa 1',optionLabel:'Solo Queso',removedIngredients:['Tomate']}]}}]}}});
 });
 await page.goto('/menu');await page.getByRole('link',{name:'Ver detalle de Combo de 3 Simples',exact:true}).click();
 await page.getByRole('group',{name:'Hamburguesa 1',exact:true}).getByRole('checkbox',{name:'Sin Tomate',exact:true}).check();await page.getByRole('button',{name:'Agregar al pedido · $ 21.000',exact:true}).click();
 await expect(page.getByText('Solo Queso — Sin Tomate',{exact:true})).toBeVisible();await page.getByRole('link',{name:'Finalizar pedido',exact:true}).click();
 await page.getByLabel('Nombre completo',{exact:true}).fill('Cliente Prueba');await page.getByLabel('Teléfono',{exact:true}).fill('1100000000');await page.getByLabel('Dirección de entrega dentro de Hurlingham').fill('Dirección de prueba 123');
 await page.getByRole('button',{name:'Finalizar por WhatsApp',exact:true}).click();await expect(page.getByText('WhatsApp simulado - sin mensajes enviados')).toBeVisible();
 expect(writes).toBe(1);expect(payload?.requestKey).toMatch(/^[a-f0-9-]{36}$/);expect(payload?.items[0].customization.choices[0].removedIngredients).toEqual(['Tomate']);expect(payload?.items[0].customization.choices[1].removedIngredients).toEqual([]);
 await page.goto('/finalizar-pedido');await expect(page.getByRole('heading',{name:'Pedido #456 registrado'})).toBeVisible();await page.locator('.checkout-empty').screenshot({path:info.outputPath('recorrido-pedido.png')});expect(writes).toBe(1);
});
