import { test, expect, type Page } from '@playwright/test';
const ingredient={_id:'000000000000000000000001',name:'Pan brioche',slug:'pan-brioche',unit:'unit',stock:48,minimumStock:12,targetStock:72,unitCost:500,purchaseUnitLabel:'Caja',purchaseUnitFactor:24,category:'Panificados',storageLocation:'Estante de cocina',trackExpiration:false,active:true,order:0,updatedAt:'2026-09-01T12:00:00.000Z'};
const habitual={_id:'habitual-1',name:'Compra semanal de panes',lines:[{ingredientId:ingredient._id,presentationQuantity:2,presentationLabel:'Caja',conversionFactor:24}]};
async function setup(page:Page){
 await page.addInitScript(()=>sessionStorage.setItem('loongis_admin_token','fixture-only-no-real-session'));
 await page.route('**/api/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  const fixtures:Record<string,unknown>={
   '/api/auth/me':{id:'owner-fixture',email:'prueba@example.test',role:'owner'},
   '/api/orders':[], '/api/inventory/ingredients':[ingredient], '/api/inventory/movements':[],
   '/api/inventory/suppliers':[], '/api/inventory/purchases':[], '/api/inventory/counts':[],
   '/api/inventory/purchase-templates':[habitual],
   '/api/inventory/alerts':{lowStock:[],shoppingList:[],expiringLots:[],expirationWindowDays:7},
   '/api/inventory/report':{revenue:0,estimatedSalesCost:0,estimatedGrossMargin:0,wasteCost:0,purchasesCost:0,inventoryValue:24000,consumptionByIngredient:[]},
   '/api/store/status':{canOrder:true,statusLabel:'Abierto',detailLabel:'Datos de prueba',orderMode:'open'},
   '/api/products':[], '/api/inventory/availability':[],
  };
  await route.fulfill({status:path in fixtures?200:500,contentType:'application/json',body:JSON.stringify({success:path in fixtures,data:fixtures[path],message:'Fixture no disponible'})});
 });
}
async function noPageOverflow(page:Page){await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);}
test.beforeEach(async({page})=>setup(page));
test('editar insumos conserva todos los campos sin desbordar la pantalla',async({page},info)=>{
 await page.goto('/admin/inventario');await page.getByRole('button',{name:'Editar en tabla',exact:true}).click();
 const field=page.getByRole('textbox',{name:'Pan brioche: Mínimo',exact:true});await field.fill('15');
 await expect(page.getByRole('button',{name:'Guardar 1 insumos modificados'})).toBeEnabled();
 await noPageOverflow(page);
 if(info.project.name!=='desktop'){
  const box=await field.boundingBox();expect(box!.width).toBeLessThan(page.viewportSize()!.width);expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(await field.evaluate(e=>getComputedStyle(e).fontSize)).toBe('16px');
 }
 await page.locator('.ingredient-batch').screenshot({path:info.outputPath('edicion-insumos.png')});
});
test('importar permite revisar todos los datos en fichas móviles',async({page},info)=>{
 await page.goto('/admin/inventario');await page.getByRole('button',{name:'Importar planilla',exact:true}).click();
 await page.getByLabel('O pegá la planilla').fill('nombre;unidad;stock_inicial;stock_minimo;stock_objetivo;costo_unitario;presentacion;unidades_por_presentacion;categoria;ubicacion;controlar_vencimientos\nPapas;gramo;5000;1000;8000;2,50;Bolsa;1000;Congelados;Freezer;si');
 await page.getByRole('button',{name:'Revisar importación',exact:true}).click();await expect(page.getByRole('button',{name:'Confirmar importación',exact:true})).toBeEnabled();await noPageOverflow(page);
 await expect(page.locator('.ingredient-batch tbody')).toContainText('5000');
 await page.locator('.ingredient-batch').screenshot({path:info.outputPath('importacion-insumos.png')});
});
test('compra habitual se prepara sin reutilizar importes o fechas de otra entrega',async({page},info)=>{
 await page.goto('/admin/stock');await page.getByLabel('Compra habitual',{exact:true}).selectOption('habitual-1');await page.getByRole('button',{name:'Usar como borrador',exact:true}).click();
 const form=page.locator('#purchase-form');await expect(form.getByLabel('Cantidad comprada',{exact:true})).toHaveValue('2');await expect(form.getByLabel('Costo total',{exact:true})).toHaveValue('');await expect(form.getByLabel('Vencimiento',{exact:true})).toHaveValue('');
 await expect(form.getByText('Ingresan: 48 un.',{exact:true})).toBeVisible();await noPageOverflow(page);
 await form.screenshot({path:info.outputPath('compra-habitual.png')});
});
test('comprobante permite retomar WhatsApp con controles táctiles visibles',async({page},info)=>{
 await page.addInitScript(()=>sessionStorage.setItem('loongis-order-receipt',JSON.stringify({orderNumber:123,whatsappUrl:'https://wa.me/0000000000?text=Prueba',expires:Date.now()+3600000})));
 await page.goto('/finalizar-pedido');await expect(page.getByRole('heading',{name:'Pedido #123 registrado'})).toBeVisible();await noPageOverflow(page);
 const button=page.getByRole('link',{name:'Volver a WhatsApp con este pedido'});const bounds=await button.boundingBox();expect(bounds!.height).toBeGreaterThanOrEqual(44);
 await page.locator('.checkout-empty').screenshot({path:info.outputPath('comprobante-pedido.png')});
});
