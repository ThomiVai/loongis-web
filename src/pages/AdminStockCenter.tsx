import { getPurchaseTemplates, savePurchaseTemplate, deletePurchaseTemplate, type PurchaseTemplate } from "../services/adminStockApi";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  Link,
  useNavigate,
  useOutletContext,
} from "react-router-dom";

import type {
  ProtectedAdminOutletContext,
} from "../components/ProtectedAdminRoute";

import {
  getAdminIngredients,
} from "../services/adminInventoryApi";

import type {
  AdminIngredient,
} from "../services/adminInventoryApi";

import {
  createAdminInventoryCount,
  createAdminPurchase,
  createAdminSupplier,
  getAdminInventoryAlerts,
  getAdminInventoryCounts,
  getAdminInventoryReport,
  getAdminExport,
  getAdminPurchases,
  getAdminSuppliers,
  resetAdminInventoryStock,
} from "../services/adminStockApi";

import type {
  AdminInventoryAlerts,
  AdminInventoryCount,
  AdminInventoryReport,
  AdminPurchase,
  AdminSupplier,
  AdminExportDataset,
} from "../services/adminStockApi";

import {
  getAdminToken,
  removeAdminToken,
} from "../utils/adminSession";

import "../styles/AdminDashboard.css";
import "../styles/AdminStockCenter.css";

type PurchaseRow = {
  ingredientId: string;
  presentationQuantity: string;
  presentationLabel: string;
  conversionFactor: string;
  totalCost: string;
  batchNumber: string;
  expirationDate: string;
};

const currency =
  new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    },
  );

const number =
  new Intl.NumberFormat(
    "es-AR",
    {
      maximumFractionDigits: 3,
    },
  );

function dateInput(
  date = new Date(),
): string {
  const offset =
    date.getTimezoneOffset();

  return new Date(
    date.getTime() -
      offset * 60_000,
  )
    .toISOString()
    .slice(0, 10);
}

function emptyPurchaseRow(
  ingredient?: AdminIngredient,
): PurchaseRow {
  return {
    ingredientId:
      ingredient?._id ?? "",
    presentationQuantity: "1",
    presentationLabel:
      ingredient
        ?.purchaseUnitLabel ?? "",
    conversionFactor:
      String(
        ingredient
          ?.purchaseUnitFactor ?? 1,
      ),
    totalCost: "",
    batchNumber: "",
    expirationDate: "",
  };
}

function unitLabel(
  unit: AdminIngredient["unit"],
): string {
  const labels = {
    unit: "un.",
    portion: "porciones",
    gram: "g",
    kilogram: "kg",
    milliliter: "ml",
    liter: "l",
  };

  return labels[unit];
}

export function AdminStockCenter() {
  const navigate =
    useNavigate();

  const { admin } =
    useOutletContext<ProtectedAdminOutletContext>();

  const token =
    getAdminToken();

  const [templates,setTemplates] = useState<PurchaseTemplate[]>([]);
  const [templateName,setTemplateName] = useState("");
  const [selectedTemplate,setSelectedTemplate] = useState("");

  const [ingredients, setIngredients] =
    useState<AdminIngredient[]>([]);
  const [suppliers, setSuppliers] =
    useState<AdminSupplier[]>([]);
  const [purchases, setPurchases] =
    useState<AdminPurchase[]>([]);
  const [counts, setCounts] =
    useState<AdminInventoryCount[]>([]);
  const [alerts, setAlerts] =
    useState<AdminInventoryAlerts | null>(null);
  const [report, setReport] =
    useState<AdminInventoryReport | null>(null);
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);
  const [success, setSuccess] =
    useState<string | null>(null);
  const [resetOpen, setResetOpen] =
    useState(false);
  const [resetConfirmation, setResetConfirmation] =
    useState("");
  const [exporting, setExporting] =
    useState<AdminExportDataset | null>(null);

  const [supplierName, setSupplierName] =
    useState("");
  const [supplierPhone, setSupplierPhone] =
    useState("");

  const [purchaseSupplier, setPurchaseSupplier] =
    useState("");
  const [invoiceNumber, setInvoiceNumber] =
    useState("");
  const [purchaseDate, setPurchaseDate] =
    useState(dateInput());
  const [purchaseNotes, setPurchaseNotes] =
    useState("");
  const [purchaseRows, setPurchaseRows] =
    useState<PurchaseRow[]>([
      emptyPurchaseRow(),
    ]);

  const [countLabel, setCountLabel] =
    useState("Cierre de stock");
  const [countNotes, setCountNotes] =
    useState("");
  const [countValues, setCountValues] =
    useState<Record<string, string>>({});

  const monthAgo =
    useMemo(() => {
      const date =
        new Date();
      date.setDate(
        date.getDate() - 29,
      );
      return dateInput(date);
    }, []);

  const [reportFrom, setReportFrom] =
    useState(monthAgo);
  const [reportTo, setReportTo] =
    useState(dateInput());

  const load =
    async () => {
      if (!token) {
        return;
      }

      try {
        const [
          ingredientData,
          supplierData,
          purchaseData,
          countData,
          alertData,
          templateData,
        ] = await Promise.all([
          getAdminIngredients(token),
          getAdminSuppliers(token),
          getAdminPurchases(token),
          getAdminInventoryCounts(token),
          getAdminInventoryAlerts(token),
          getPurchaseTemplates(token),
        ]);

        setIngredients(
          ingredientData,
        );
        setSuppliers(
          supplierData,
        );
        setPurchases(
          purchaseData,
        );
        setCounts(countData);
        setAlerts(alertData);
        setTemplates(templateData);
        setCountValues(
          Object.fromEntries(
            ingredientData
              .filter((item) => item.active)
              .map((item) => [
                item._id,
                "",
              ]),
          ),
        );

        if (admin.role === "owner") {
          setReport(
            await getAdminInventoryReport(
              token,
              reportFrom,
              reportTo,
            ),
          );
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el centro de stock.",
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    const timeout =
      window.setTimeout(
        () => {
          void load();
        },
        0,
      );

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
    // La carga inicial usa las fechas iniciales.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const logout = () => {
    removeAdminToken();
    navigate(
      "/admin/login",
      { replace: true },
    );
  };

  const createSupplier =
    async (
      event: FormEvent,
    ) => {
      event.preventDefault();

      if (
        !token ||
        !supplierName.trim()
      ) {
        return;
      }

      setSaving(true);
      setError(null);
      setSuccess(null);

      try {
        const created =
          await createAdminSupplier(
            token,
            {
              name:
                supplierName.trim(),
              phone:
                supplierPhone.trim() ||
                undefined,
            },
          );

        setSuppliers((current) => [
          ...current,
          created,
        ]);
        setSupplierName("");
        setSupplierPhone("");
        setSuccess(
          "Proveedor guardado.",
        );
      } catch (saveError) {
        setError(
          saveError instanceof Error
            ? saveError.message
            : "No se pudo guardar el proveedor.",
        );
      } finally {
        setSaving(false);
      }
    };

  const updatePurchaseRow = (
    index: number,
    patch: Partial<PurchaseRow>,
  ) => {
    setPurchaseRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index
          ? { ...row, ...patch }
          : row,
      ),
    );
  };

  const selectPurchaseIngredient = (
    index: number,
    ingredientId: string,
  ) => {
    const ingredient =
      ingredients.find(
        (item) =>
          item._id ===
          ingredientId,
      );

    updatePurchaseRow(
      index,
      emptyPurchaseRow(
        ingredient,
      ),
    );
  };

  const preparePurchaseDraft = (source: PurchaseTemplate | AdminPurchase) => {
    if (saving) return;
    if (purchaseRows.some(row => row.ingredientId) && !window.confirm("¿Reemplazar el borrador actual de compra?")) return;
    const sourceLines = source.lines.map(line => {
      const ingredientId = "ingredientId" in line ? line.ingredientId : line.ingredient;
      if (!ingredients.some(item => item._id === ingredientId && item.active)) throw new Error("La compra contiene un insumo inactivo o eliminado. Revisala antes de repetirla.");
      return { ingredientId, presentationQuantity:String(line.presentationQuantity), presentationLabel:line.presentationLabel, conversionFactor:String(line.conversionFactor), totalCost:"", batchNumber:"", expirationDate:"" };
    });
    const supplierId = "supplierId" in source ? source.supplierId : "supplier" in source ? source.supplier : undefined;
    setPurchaseSupplier(suppliers.some(item => item._id === supplierId && item.active) ? supplierId! : "");
    setPurchaseRows(sourceLines); setInvoiceNumber(""); setPurchaseDate(dateInput()); setPurchaseNotes(""); setError(null);
    setSuccess("Borrador preparado. Completá los costos actuales, lote y vencimiento. El stock todavía no cambió.");
    document.getElementById("purchase-form")?.scrollIntoView({behavior:"smooth",block:"start"});
  };
  const applyDraft = (source: PurchaseTemplate | AdminPurchase) => { try { preparePurchaseDraft(source); } catch(e) {setError((e as Error).message);} };
  const saveHabitual = async () => {
    if (!token || saving) return;
    setSaving(true);setError(null);
    try {
      const item = await savePurchaseTemplate(token,{name:templateName.trim(), supplierId:purchaseSupplier||undefined, lines:purchaseRows.map(row=>({ingredientId:row.ingredientId,presentationQuantity:Number(row.presentationQuantity),presentationLabel:row.presentationLabel,conversionFactor:Number(row.conversionFactor)}))});
      setTemplates(current=>[...current,item]);setTemplateName("");setSuccess("Compra habitual guardada. No se registró una compra ni se modificó el stock.");
    } catch(e){setError((e as Error).message);}finally{setSaving(false);}
  };
  const removeHabitual = async () => {
    if(!token||!selectedTemplate||saving||!window.confirm("¿Eliminar esta compra habitual? Las compras registradas se conservan."))return;
    setSaving(true);setError(null);
    try {await deletePurchaseTemplate(token,selectedTemplate);setTemplates(current=>current.filter(item=>item._id!==selectedTemplate));setSelectedTemplate("");}catch(e){setError((e as Error).message);}finally{setSaving(false);}
  };

  const savePurchase =
    async (
      event: FormEvent,
    ) => {
      event.preventDefault();

      if (!token) {
        return;
      }

      const lines =
        purchaseRows.map((row) => ({
          ingredientId:
            row.ingredientId,
          presentationQuantity:
            Number(
              row.presentationQuantity,
            ),
          presentationLabel:
            row.presentationLabel.trim() ||
            "presentación",
          conversionFactor:
            Number(
              row.conversionFactor,
            ),
          totalCost:
            Number(row.totalCost),
          batchNumber:
            row.batchNumber.trim() ||
            undefined,
          expirationDate:
            row.expirationDate ||
            undefined,
        }));

      if (purchaseRows.some(row => !row.totalCost.trim()) ||
        lines.some(
          (line) =>
            !line.ingredientId ||
            !Number.isFinite(
              line.presentationQuantity,
            ) ||
            line.presentationQuantity <= 0 ||
            !Number.isFinite(
              line.conversionFactor,
            ) ||
            line.conversionFactor <= 0 ||
            !Number.isFinite(
              line.totalCost,
            ) ||
            line.totalCost < 0,
        )
      ) {
        setError(
          "Revisá los datos de todos los insumos de la compra.",
        );
        return;
      }

      setSaving(true);
      setError(null);
      setSuccess(null);

      try {
        const created =
          await createAdminPurchase(
            token,
            {
              supplierId:
                purchaseSupplier ||
                undefined,
              invoiceNumber:
                invoiceNumber.trim() ||
                undefined,
              purchasedAt:
                purchaseDate,
              notes:
                purchaseNotes.trim() ||
                undefined,
              lines,
            },
          );

        setPurchases((current) => [
          created,
          ...current,
        ]);
        setPurchaseRows([
          emptyPurchaseRow(),
        ]);
        setInvoiceNumber("");
        setPurchaseNotes("");
        setSuccess(
          "Compra registrada y stock actualizado.",
        );
        await load();
      } catch (saveError) {
        setError(
          saveError instanceof Error
            ? saveError.message
            : "No se pudo registrar la compra.",
        );
      } finally {
        setSaving(false);
      }
    };

  const saveCount =
    async (
      event: FormEvent,
    ) => {
      event.preventDefault();

      if (!token) {
        return;
      }

      const items =
        ingredients
          .filter((item) => item.active)
          .map((item) => ({
            ingredientId:
              item._id,
            countedStock:
              Number(
                countValues[item._id],
              ),
          }));

      if (
        items.some(
          (item) =>
            !countValues[item.ingredientId]?.trim() ||
            !Number.isFinite(
              item.countedStock,
            ) ||
            item.countedStock < 0,
        )
      ) {
        setError(
          "Completá todos los conteos con valores iguales o mayores a cero.",
        );
        return;
      }

      if (
        !window.confirm(
          "Se ajustará el stock según el conteo físico ingresado. ¿Continuar?",
        )
      ) {
        return;
      }

      setSaving(true);
      setError(null);
      setSuccess(null);

      try {
        const count =
          await createAdminInventoryCount(
            token,
            {
              label:
                countLabel.trim() ||
                undefined,
              countedAt:
                new Date().toISOString(),
              notes:
                countNotes.trim() ||
                undefined,
              items,
            },
          );

        setCounts((current) => [
          count,
          ...current,
        ]);
        setSuccess(
          "Conteo guardado y diferencias aplicadas.",
        );
        await load();
      } catch (saveError) {
        setError(
          saveError instanceof Error
            ? saveError.message
            : "No se pudo guardar el conteo.",
        );
      } finally {
        setSaving(false);
      }
    };

  const refreshReport =
    async () => {
      if (
        !token ||
        admin.role !== "owner"
      ) {
        return;
      }

      setSaving(true);
      setError(null);
      try {
        setReport(
          await getAdminInventoryReport(
            token,
            reportFrom,
            reportTo,
          ),
        );
      } catch (reportError) {
        setError(
          reportError instanceof Error
            ? reportError.message
            : "No se pudo actualizar el reporte.",
        );
      } finally {
        setSaving(false);
      }
    };

  const downloadExport =
    async (
      dataset: AdminExportDataset,
    ) => {
      if (
        !token ||
        admin.role !== "owner"
      ) {
        return;
      }

      setExporting(dataset);
      setError(null);
      setSuccess(null);

      try {
        const result =
          await getAdminExport(
            token,
            dataset,
          );
        const url =
          URL.createObjectURL(
            result.blob,
          );
        const anchor =
          document.createElement("a");
        anchor.href = url;
        anchor.download =
          result.filename;
        anchor.click();
        URL.revokeObjectURL(url);
        setSuccess(
          "Exportación descargada.",
        );
      } catch (exportError) {
        setError(
          exportError instanceof Error
            ? exportError.message
            : "No se pudo descargar la exportación.",
        );
      } finally {
        setExporting(null);
      }
    };

  const resetStock =
    async (
      event: FormEvent,
    ) => {
      event.preventDefault();

      if (
        !token ||
        admin.role !== "owner" ||
        resetConfirmation !==
          "REINICIAR"
      ) {
        return;
      }

      setSaving(true);
      setError(null);
      setSuccess(null);

      try {
        await resetAdminInventoryStock(
          token,
          resetConfirmation,
        );
        setResetOpen(false);
        setResetConfirmation("");
        setSuccess(
          "Stock puesto en cero. El reinicio quedó registrado como conteo físico.",
        );
        await load();
      } catch (resetError) {
        setError(
          resetError instanceof Error
            ? resetError.message
            : "No se pudo reiniciar el stock.",
        );
      } finally {
        setSaving(false);
      }
    };

  if (loading) {
    return (
      <main className="admin-dashboard">
        <div className="admin-stock__loading">
          Cargando centro de stock...
        </div>
      </main>
    );
  }

  return (
    <main className="admin-dashboard">
      <div className="admin-dashboard__container">
        <header className="admin-dashboard__header">
          <div>
            <span className="admin-dashboard__eyebrow">
              Operación
            </span>
            <h1>
              Centro de stock
            </h1>
            <p>
              Compras, alertas, vencimientos y conteos físicos.
            </p>
          </div>

          <div className="admin-dashboard__header-actions">
            <Link
              to="/"
              className="admin-dashboard__store-link"
            >
              ← Volver a la tienda
            </Link>
            <button
              type="button"
              className="admin-dashboard__logout"
              onClick={logout}
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <nav className="admin-dashboard__nav">
          <Link to="/admin" className="admin-dashboard__nav-link">
            Productos
          </Link>
          <Link to="/admin/pedidos" className="admin-dashboard__nav-link">
            Pedidos
          </Link>
          <Link to="/admin/ventas" className="admin-dashboard__nav-link">
            Ventas
          </Link>
          <Link to="/admin/inventario" className="admin-dashboard__nav-link">
            Inventario
          </Link>
          <Link to="/admin/stock" className="admin-dashboard__nav-link admin-dashboard__nav-link--active">
            Centro de stock
          </Link>
          {admin.role === "owner" && (
            <Link to="/admin/recetas" className="admin-dashboard__nav-link">
              Recetas
            </Link>
          )}
          {admin.role === "owner" && (
            <Link to="/admin/usuarios" className="admin-dashboard__nav-link">
              Accesos
            </Link>
          )}
        </nav>

        {error && (
          <div className="admin-stock__message admin-stock__message--error" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="admin-stock__message admin-stock__message--success" role="status">
            {success}
          </div>
        )}

        <section className="admin-stock__summary">
          <article>
            <span>
              Stock bajo o agotado
            </span>
            <strong>
              {alerts?.lowStock.length ?? 0}
            </strong>
          </article>
          <article>
            <span>
              Lotes próximos o vencidos
            </span>
            <strong>
              {alerts?.expiringLots.length ?? 0}
            </strong>
          </article>
          <article>
            <span>
              Compras registradas
            </span>
            <strong>
              {purchases.length}
            </strong>
          </article>
          <article>
            <span>
              Conteos físicos
            </span>
            <strong>
              {counts.length}
            </strong>
          </article>
        </section>

        <section className="admin-stock__grid">
          <article className="admin-stock__panel">
            <header>
              <h2>
                Lista de compras
              </h2>
              <p>
                Calculada con el stock objetivo definido por el dueño.
              </p>
            </header>

            {alerts?.shoppingList.length ? (
              <div className="admin-stock__list">
                {alerts.shoppingList.map((item) => (
                  <div key={item.ingredientId}>
                    <span>
                      {item.name}
                    </span>
                    <strong>
                      Comprar {number.format(item.suggestedQuantity)} {unitLabel(item.unit)}
                    </strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="admin-stock__empty">
                No hay compras sugeridas.
              </p>
            )}
          </article>

          <article className="admin-stock__panel">
            <header>
              <h2>
                Vencimientos
              </h2>
              <p>
                Lotes que vencen dentro de {alerts?.expirationWindowDays ?? 7} días o ya vencieron.
              </p>
            </header>

            {alerts?.expiringLots.length ? (
              <div className="admin-stock__list">
                {alerts.expiringLots.map((lot) => (
                  <div key={lot._id}>
                    <span>
                      {typeof lot.ingredient === "string"
                        ? "Insumo"
                        : lot.ingredient.name}
                    </span>
                    <strong>
                      {new Date(lot.expirationDate).toLocaleDateString("es-AR")} · {number.format(lot.remainingQuantity)}
                    </strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="admin-stock__empty">
                No hay vencimientos cercanos cargados.
              </p>
            )}
          </article>
        </section>

        <section className="admin-stock__panel">
          <header>
            <h2>
              Registrar compra
            </h2>
            <p>
              La cantidad comprada se convierte a la unidad base y actualiza el costo promedio.
            </p>
          </header>

          <div className="admin-stock__form-grid">
            <label><span>Compra habitual</span><select aria-label="Compra habitual" disabled={saving} value={selectedTemplate} onChange={e=>setSelectedTemplate(e.target.value)}><option value="">Elegir...</option>{templates.map(item=><option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
            <button type="button" className="admin-stock__secondary" disabled={saving||!selectedTemplate} onClick={()=>{const item=templates.find(t=>t._id===selectedTemplate);if(item)applyDraft(item);}}>Usar como borrador</button>
            {admin.role==='owner'&&<button type="button" className="admin-stock__secondary" disabled={saving||!selectedTemplate} onClick={()=>void removeHabitual()}>Eliminar habitual</button>}
          </div>
          <form id="purchase-form" className="admin-stock__form" onSubmit={savePurchase}>
            <fieldset disabled={saving} className="admin-stock__fieldset">
            <div className="admin-stock__form-grid">
              <label>
                <span>Proveedor</span>
                <select value={purchaseSupplier} onChange={(event) => setPurchaseSupplier(event.target.value)}>
                  <option value="">Sin proveedor</option>
                  {suppliers.filter((item) => item.active).map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Comprobante</span>
                <input value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} placeholder="Opcional" />
              </label>
              <label>
                <span>Fecha</span>
                <input type="date" value={purchaseDate} onChange={(event) => setPurchaseDate(event.target.value)} required />
              </label>
            </div>

            <div className="admin-stock__purchase-lines">
              {purchaseRows.map((row, index) => {
                const selected = ingredients.find((item) => item._id === row.ingredientId);
                return (
                  <div className="admin-stock__purchase-row" key={`purchase-${index}`}>
                    <label>
                      <span>Insumo</span>
                      <select value={row.ingredientId} onChange={(event) => selectPurchaseIngredient(index, event.target.value)} required>
                        <option value="">Elegir...</option>
                        {ingredients.filter((item) => item.active).map((ingredient) => (
                          <option key={ingredient._id} value={ingredient._id}>
                            {ingredient.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Cantidad comprada</span>
                      <input type="number" min="0.000001" step="0.01" value={row.presentationQuantity} onChange={(event) => updatePurchaseRow(index, { presentationQuantity: event.target.value })} required />
                    </label>
                    <label>
                      <span>Presentación</span>
                      <input value={row.presentationLabel} onChange={(event) => updatePurchaseRow(index, { presentationLabel: event.target.value })} placeholder="Caja, bolsa..." required />
                    </label>
                    <label>
                      <span>Equivale a</span>
                      <input type="number" min="0.000001" step="0.01" value={row.conversionFactor} onChange={(event) => updatePurchaseRow(index, { conversionFactor: event.target.value })} required />
                      <small>{selected ? `${unitLabel(selected.unit)} por presentación` : "unidades base"}</small>
                      {selected && <small>Ingresan: {number.format(Number(row.presentationQuantity) * Number(row.conversionFactor))} {unitLabel(selected.unit)}</small>}
                    </label>
                    <label>
                      <span>Costo total</span>
                      <input type="number" min="0" step="0.01" value={row.totalCost} onChange={(event) => updatePurchaseRow(index, { totalCost: event.target.value })} required />
                    </label>
                    <label>
                      <span>Lote</span>
                      <input value={row.batchNumber} onChange={(event) => updatePurchaseRow(index, { batchNumber: event.target.value })} placeholder="Opcional" />
                    </label>
                    <label>
                      <span>Vencimiento</span>
                      <input type="date" value={row.expirationDate} onChange={(event) => updatePurchaseRow(index, { expirationDate: event.target.value })} />
                    </label>
                    <button type="button" className="admin-stock__remove" onClick={() => setPurchaseRows((current) => current.filter((_item, rowIndex) => rowIndex !== index))} disabled={purchaseRows.length === 1}>
                      Quitar
                    </button>
                  </div>
                );
              })}
            </div>

            <button type="button" className="admin-stock__secondary" onClick={() => setPurchaseRows((current) => [...current, emptyPurchaseRow()])}>
              + Agregar insumo
            </button>

            <label>
              <span>Notas de la compra</span>
              <textarea rows={3} value={purchaseNotes} onChange={(event) => setPurchaseNotes(event.target.value)} />
            </label>

            <div className="admin-stock__form-grid"><label><span>Nombre para guardar como habitual</span><input value={templateName} maxLength={80} onChange={e=>setTemplateName(e.target.value)} placeholder="Ej.: Reposición semanal de panes" /></label><button className="admin-stock__secondary" type="button" disabled={saving||templateName.trim().length<2} onClick={()=>void saveHabitual()}>Guardar como habitual</button></div>
            <p>La habitual guarda proveedor, insumos y presentaciones. Cada entrega requiere revisar cantidades, costos y vencimientos.</p>
            <button className="admin-stock__primary" type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Registrar compra y reponer"}
            </button>
            </fieldset>
          </form>
        </section>

        <section className="admin-stock__grid">
          <article className="admin-stock__panel">
            <header>
              <h2>Nuevo proveedor</h2>
            </header>
            <form className="admin-stock__form" onSubmit={createSupplier}>
              <label>
                <span>Nombre</span>
                <input value={supplierName} onChange={(event) => setSupplierName(event.target.value)} required />
              </label>
              <label>
                <span>Teléfono</span>
                <input value={supplierPhone} onChange={(event) => setSupplierPhone(event.target.value)} />
              </label>
              <button className="admin-stock__primary" type="submit" disabled={saving}>
                Guardar proveedor
              </button>
            </form>
          </article>

          <article className="admin-stock__panel">
            <header>
              <h2>Últimas compras</h2>
            </header>
            <div className="admin-stock__list">
              {purchases.slice(0, 8).map((purchase) => (
                <div key={purchase._id}>
                  <span>
                    {purchase.supplierName ?? "Sin proveedor"} · {new Date(purchase.purchasedAt).toLocaleDateString("es-AR")}
                  </span>
                  {admin.role === "owner" && (
                    <strong>{currency.format(purchase.totalCost)}</strong>
                  )}
                  <button className="admin-stock__secondary" disabled={saving} type="button" onClick={()=>applyDraft(purchase)}>Repetir como borrador</button>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="admin-stock__panel">
          <header>
            <h2>
              Conteo físico / cierre
            </h2>
            <p>
              Contá cada insumo y completá los campos vacíos. Las diferencias quedarán registradas como ajustes.
            </p>
          </header>
          <form className="admin-stock__form" onSubmit={saveCount}>
            <div className="admin-stock__form-grid">
              <label>
                <span>Nombre del conteo</span>
                <input value={countLabel} onChange={(event) => setCountLabel(event.target.value)} />
              </label>
              <label>
                <span>Observaciones</span>
                <input value={countNotes} onChange={(event) => setCountNotes(event.target.value)} />
              </label>
            </div>
            <div className="admin-stock__count-grid">
              {ingredients.filter((item) => item.active).map((ingredient) => (
                <label key={ingredient._id}>
                  <span>{ingredient.name}</span>
                  <small>Sistema: {number.format(ingredient.stock)} {unitLabel(ingredient.unit)}</small>
                  <input type="number" min="0" step="0.01" value={countValues[ingredient._id] ?? ""} onChange={(event) => setCountValues((current) => ({ ...current, [ingredient._id]: event.target.value }))} required />
                </label>
              ))}
            </div>
            <button className="admin-stock__primary" type="submit" disabled={saving || ingredients.length === 0}>
              Guardar cierre y ajustar diferencias
            </button>
          </form>
        </section>

        {admin.role === "owner" && (
          <section className="admin-stock__panel admin-stock__tools">
            <header>
              <h2>
                Respaldo y herramientas
              </h2>
              <p>
                Descargá la información operativa o prepará el inventario para comenzar nuevamente.
              </p>
            </header>

            <div className="admin-stock__exports" aria-label="Exportaciones CSV">
              {([
                ["orders", "Pedidos"],
                ["sales", "Ventas"],
                ["purchases", "Compras"],
                ["movements", "Movimientos"],
              ] as const).map(([dataset, label]) => (
                <button
                  key={dataset}
                  type="button"
                  className="admin-stock__secondary"
                  disabled={exporting !== null || saving}
                  onClick={() => void downloadExport(dataset)}
                >
                  {exporting === dataset
                    ? "Preparando…"
                    : `Exportar ${label}`}
                </button>
              ))}
            </div>

            <div className="admin-stock__danger-zone">
              <div>
                <h3>
                  Poner stock en cero
                </h3>
                <p>
                  Conserva insumos, recetas, productos, pedidos, compras e historial. Si el control automático está activo, los productos pueden quedar sin disponibilidad hasta cargar nuevas existencias.
                </p>
              </div>

              {!resetOpen ? (
                <button
                  type="button"
                  className="admin-stock__danger-button"
                  disabled={saving}
                  onClick={() => {
                    setResetOpen(true);
                    setResetConfirmation("");
                  }}
                >
                  Iniciar puesta en cero
                </button>
              ) : (
                <form
                  className="admin-stock__reset-form"
                  onSubmit={resetStock}
                >
                  <label>
                    <span>
                      Escribí REINICIAR para confirmar
                    </span>
                    <input
                      value={resetConfirmation}
                      onChange={(event) =>
                        setResetConfirmation(
                          event.target.value,
                        )
                      }
                      autoComplete="off"
                      disabled={saving}
                    />
                  </label>
                  <div>
                    <button
                      type="button"
                      className="admin-stock__secondary"
                      disabled={saving}
                      onClick={() => {
                        setResetOpen(false);
                        setResetConfirmation("");
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="admin-stock__danger-button"
                      disabled={
                        saving ||
                        resetConfirmation !== "REINICIAR"
                      }
                    >
                      {saving
                        ? "Reiniciando…"
                        : "Confirmar puesta en cero"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        )}

        {admin.role === "owner" && report && (
          <section className="admin-stock__panel">
            <header>
              <h2>
                Reporte de costos y consumo
              </h2>
              <p>
                Los importes son estimados según los costos cargados por el dueño.
              </p>
            </header>
            <div className="admin-stock__report-filter">
              <label>
                <span>Desde</span>
                <input type="date" value={reportFrom} onChange={(event) => setReportFrom(event.target.value)} />
              </label>
              <label>
                <span>Hasta</span>
                <input type="date" value={reportTo} onChange={(event) => setReportTo(event.target.value)} />
              </label>
              <button type="button" className="admin-stock__secondary" onClick={() => void refreshReport()} disabled={saving}>
                Actualizar reporte
              </button>
            </div>
            <div className="admin-stock__summary">
              <article><span>Ventas confirmadas</span><strong>{currency.format(report.revenue)}</strong></article>
              <article><span>Costo consumido</span><strong>{currency.format(report.estimatedSalesCost)}</strong></article>
              <article><span>Margen bruto estimado</span><strong>{currency.format(report.estimatedGrossMargin)}</strong></article>
              <article><span>Mermas</span><strong>{currency.format(report.wasteCost)}</strong></article>
              <article><span>Compras</span><strong>{currency.format(report.purchasesCost)}</strong></article>
              <article><span>Valor del inventario</span><strong>{currency.format(report.inventoryValue)}</strong></article>
            </div>
            <div className="admin-stock__list">
              {report.consumptionByIngredient.map((item) => (
                <div key={item.ingredientId}>
                  <span>{item.name}</span>
                  <strong>{number.format(item.quantity)} {item.unit ? unitLabel(item.unit) : ""} · {currency.format(item.estimatedCost)}</strong>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
