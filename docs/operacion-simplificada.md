# Operación simplificada

## Cargar los insumos

Inventario → Importar planilla → Descargar plantilla CSV. Se abre con Excel o Google Sheets. Conservar encabezados y orden. Guardar CSV UTF-8 o pegar las celdas con encabezados. No se leen archivos XLSX directamente.

- Máximo 200 filas, 1 MB. Separadores: punto y coma, coma o tabulación.
- Unidades: unidad, porcion, gramo, kilogramo, mililitro, litro (también g/kg/ml/l).
- Decimales con coma o punto; no usar separadores de miles.
- Completar explícitamente stock inicial, mínimo, objetivo, costo y equivalencia. Controlar vencimientos: si/no.
- La vista previa valida todas las filas. Duplicados y errores bloquean el guardado.
- Solo crea insumos nuevos. Para los existentes usar Editar en tabla. El stock actual no cambia desde esa tabla; usar movimientos/conteos.
- La tabla guarda solo filas modificadas y rechaza todo el lote si algún insumo cambió mientras se editaba.
- El guardado inicial genera movimientos y lotes; los lotes iniciales no tienen fecha de vencimiento. Para trazabilidad completa, iniciar en cero e ingresar lotes reales por compra/reposición con sus fechas.

## Compras

En Centro de stock, completar proveedor, insumos y presentaciones; elegir un nombre y Guardar como habitual. No registra mercadería. Las habituales se comparten entre las cuentas; solo el dueño puede eliminarlas.

Usar como borrador o Repetir como borrador recupera insumos, proveedor activo, cantidades y equivalencias. No copia importe, comprobante, notas, lote ni vencimiento. Completar los importes actuales y revisar la entrega antes de Registrar compra y reponer.

Si cambia un insumo a inactivo, la repetición se detiene para revisión. Se muestra cuántas unidades base ingresarán por renglón. El conteo físico comienza con casillas vacías y requiere cantidades explícitas.

## Pedidos

El panel muestra pendientes y consulta cada 20 segundos. Activar aviso sonoro requiere pulsar el botón en esa sesión. La pestaña debe permanecer abierta; los navegadores pueden suspenderla en segundo plano. No es una notificación push para la aplicación cerrada.

El cliente ve un comprobante local al volver de WhatsApp y puede retomar el mismo mensaje. Regresar a WhatsApp no crea otro pedido. Un identificador por intento evita duplicados ante reintentos iguales durante 8 horas en la misma pestaña. Empezar otro pedido crea un intento nuevo; no cancela el anterior. No garantiza deduplicación entre dispositivos.

## Entrega y pendientes

Desplegar primero la API compatible. Las pantallas nuevas requieren sus endpoints. Luego desplegar el frontend. No activa el descuento automático ni cambia recetas o existencias por sí solo.

Pendientes del dueño: teléfono oficial, costo/zona de envío, condiciones de pago, fotos, cantidades iniciales, recetas y responsables. Acordar el circuito de confirmación. Validar finalmente en celular con el dueño y pedidos identificados como prueba.
