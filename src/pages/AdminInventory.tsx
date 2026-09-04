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
  createAdminIngredient,
  createAdminInventoryMovement,
  getAdminIngredients,
  getAdminInventoryMovements,
  updateAdminIngredient,
} from "../services/adminInventoryApi";

import type {
  AdminIngredient,
  AdminIngredientUnit,
  AdminInventoryMovement,
  AdminInventoryMovementType,
} from "../services/adminInventoryApi";

import {
  getAdminToken,
  removeAdminToken,
} from "../utils/adminSession";

import "../styles/AdminDashboard.css";
import "../styles/AdminInventory.css";

/* ========================================
   FORMATO
======================================== */

const currencyFormatter =
  new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    },
  );

const numberFormatter =
  new Intl.NumberFormat(
    "es-AR",
    {
      maximumFractionDigits: 2,
    },
  );

const dateFormatter =
  new Intl.DateTimeFormat(
    "es-AR",
    {
      dateStyle: "short",
      timeStyle: "short",
    },
  );

function getUnitLabel(
  unit: AdminIngredientUnit,
): string {
  switch (unit) {
    case "unit":
      return "unidad";
    case "portion":
      return "porción";
    case "gram":
      return "g";
    case "kilogram":
      return "kg";
    case "milliliter":
      return "ml";
    case "liter":
      return "l";
  }
}

function getMovementLabel(
  type:
    AdminInventoryMovement["type"],
): string {
  switch (type) {
    case "initial":
      return "Stock inicial";
    case "restock":
      return "Reposición";
    case "waste":
      return "Merma";
    case "adjustment":
      return "Ajuste";
    case "sale":
      return "Venta";
    case "reversal":
      return "Reintegro";
  }
}

function getIngredientName(
  movement:
    AdminInventoryMovement,
): string {
  if (
    typeof movement.ingredient ===
    "string"
  ) {
    return "Insumo";
  }

  return (
    movement.ingredient.name
  );
}

function formatDate(
  value?: string,
): string {
  if (!value) {
    return "Sin fecha";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Sin fecha";
  }

  return dateFormatter.format(
    date,
  );
}

function isAuthError(
  message: string,
): boolean {
  const normalized =
    message.toLowerCase();

  return (
    normalized.includes(
      "sesión",
    ) ||
    normalized.includes(
      "autentic",
    ) ||
    normalized.includes(
      "token",
    )
  );
}

/* ========================================
   FORMULARIOS
======================================== */

type NewIngredientForm = {
  name: string;
  unit: AdminIngredientUnit;
  stock: string;
  minimumStock: string;
  targetStock: string;
  unitCost: string;
  purchaseUnitLabel: string;
  purchaseUnitFactor: string;
  category: string;
  storageLocation: string;
  trackExpiration: boolean;
};

type EditIngredientForm = {
  name: string;
  unit: AdminIngredientUnit;
  minimumStock: string;
  targetStock: string;
  unitCost: string;
  purchaseUnitLabel: string;
  purchaseUnitFactor: string;
  category: string;
  storageLocation: string;
  trackExpiration: boolean;
  active: boolean;
};

type MovementMode =
  | "restock"
  | "waste"
  | "adjustment";

type MovementForm = {
  mode: MovementMode;
  value: string;
  note: string;
  batchNumber: string;
  expirationDate: string;
};

/* ========================================
   COMPONENTE
======================================== */

export function AdminInventory() {
  const navigate =
    useNavigate();

  const {
    admin,
  } =
    useOutletContext<ProtectedAdminOutletContext>();

  const token =
    getAdminToken();

  const [
    ingredients,
    setIngredients,
  ] =
    useState<AdminIngredient[]>(
      [],
    );

  const [
    movements,
    setMovements,
  ] =
    useState<
      AdminInventoryMovement[]
    >([]);

  const [historyType, setHistoryType] =
    useState<AdminInventoryMovementType | "">("");
  const [historyIngredient, setHistoryIngredient] =
    useState("");
  const [historyFrom, setHistoryFrom] =
    useState("");
  const [historyTo, setHistoryTo] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    creating,
    setCreating,
  ] =
    useState(false);

  const [
    newIngredient,
    setNewIngredient,
  ] =
    useState<NewIngredientForm>({
      name: "",
      unit: "unit",
      stock: "0",
      minimumStock: "0",
      targetStock: "0",
      unitCost: "0",
      purchaseUnitLabel: "",
      purchaseUnitFactor: "1",
      category: "",
      storageLocation: "",
      trackExpiration: false,
    });

  const [
    editingIngredient,
    setEditingIngredient,
  ] =
    useState<AdminIngredient | null>(
      null,
    );

  const [
    editForm,
    setEditForm,
  ] =
    useState<EditIngredientForm>({
      name: "",
      unit: "unit",
      minimumStock: "0",
      targetStock: "0",
      unitCost: "0",
      purchaseUnitLabel: "",
      purchaseUnitFactor: "1",
      category: "",
      storageLocation: "",
      trackExpiration: false,
      active: true,
    });

  const [
    savingEdit,
    setSavingEdit,
  ] =
    useState(false);

  const [
    movingIngredient,
    setMovingIngredient,
  ] =
    useState<AdminIngredient | null>(
      null,
    );

  const [
    movementForm,
    setMovementForm,
  ] =
    useState<MovementForm>({
      mode: "restock",
      value: "",
      note: "",
      batchNumber: "",
      expirationDate: "",
    });

  const [
    savingMovement,
    setSavingMovement,
  ] =
    useState(false);

  /* ========================================
     CARGA INICIAL
  ======================================== */

  useEffect(() => {
    if (!token) {
      return;
    }

    const currentToken =
      token;

    let cancelled =
      false;

    async function loadInventory() {
      try {
        const [
          ingredientsData,
          movementsData,
        ] =
          await Promise.all([
            getAdminIngredients(
              currentToken,
            ),

            getAdminInventoryMovements(
              currentToken,
              30,
            ),
          ]);

        if (cancelled) {
          return;
        }

        setIngredients(
          ingredientsData,
        );

        setMovements(
          movementsData,
        );

        setError(null);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        const message =
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el inventario.";

        if (
          isAuthError(
            message,
          )
        ) {
          removeAdminToken();

          navigate(
            "/admin/login",
            {
              replace: true,
            },
          );

          return;
        }

        setError(
          message,
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    void loadInventory();

    return () => {
      cancelled = true;
    };
  }, [
    navigate,
    token,
  ]);

  /* ========================================
     RESUMEN
  ======================================== */

  const activeIngredients =
    useMemo(
      () =>
        ingredients.filter(
          (ingredient) =>
            ingredient.active,
        ),
      [ingredients],
    );

  const outOfStockCount =
    activeIngredients.filter(
      (ingredient) =>
        ingredient.stock === 0,
    ).length;

  const lowStockCount =
    activeIngredients.filter(
      (ingredient) =>
        ingredient.stock > 0 &&
        ingredient.stock <=
          ingredient.minimumStock,
    ).length;

  const inventoryValue =
    activeIngredients.reduce(
      (
        total,
        ingredient,
      ) =>
        total +
        ingredient.stock *
          ingredient.unitCost,
      0,
    );

  /* ========================================
     SESIÓN
  ======================================== */

  const handleLogout = () => {
    removeAdminToken();

    navigate(
      "/admin/login",
      {
        replace: true,
      },
    );
  };

  /* ========================================
     REFRESH
  ======================================== */

  const handleRefresh =
    async () => {
      if (!token) {
        return;
      }

      setRefreshing(true);
      setError(null);

      try {
        const [
          ingredientsData,
          movementsData,
        ] =
          await Promise.all([
            getAdminIngredients(
              token,
            ),

            getAdminInventoryMovements(
              token,
              30,
            ),
          ]);

        setIngredients(
          ingredientsData,
        );

        setMovements(
          movementsData,
        );
      } catch (refreshError) {
        const message =
          refreshError instanceof Error
            ? refreshError.message
            : "No se pudo actualizar el inventario.";

        setError(message);
      } finally {
        setRefreshing(false);
      }
    };

  const applyHistoryFilters =
    async () => {
      if (!token) return;

      setRefreshing(true);
      setError(null);
      try {
        setMovements(
          await getAdminInventoryMovements(
            token,
            500,
            {
              ingredientId:
                historyIngredient ||
                undefined,
              type:
                historyType ||
                undefined,
              from:
                historyFrom ||
                undefined,
              to:
                historyTo ||
                undefined,
            },
          ),
        );
      } catch (filterError) {
        setError(
          filterError instanceof Error
            ? filterError.message
            : "No se pudo filtrar el historial.",
        );
      } finally {
        setRefreshing(false);
      }
    };

  const exportHistory = () => {
    const escape = (
      value: string | number | undefined,
    ) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = [
      [
        "Fecha",
        "Insumo",
        "Movimiento",
        "Cambio",
        "Stock anterior",
        "Stock nuevo",
        "Administrador",
        "Nota",
      ],
      ...movements.map((movement) => [
        movement.createdAt ?? "",
        getIngredientName(movement),
        getMovementLabel(movement.type),
        movement.change,
        movement.previousStock,
        movement.newStock,
        movement.performedByEmail ?? "",
        movement.note ?? "",
      ]),
    ];

    const csv =
      rows
        .map((row) =>
          row.map(escape).join(";"),
        )
        .join("\n");

    const url =
      URL.createObjectURL(
        new Blob(
          [`\uFEFF${csv}`],
          {
            type: "text/csv;charset=utf-8",
          },
        ),
      );

    const anchor =
      document.createElement("a");
    anchor.href = url;
    anchor.download =
      `loongis-movimientos-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  /* ========================================
     CREAR INSUMO
  ======================================== */

  const handleCreateIngredient =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (!token) {
        return;
      }

      const stock =
        Number(
          newIngredient.stock,
        );

      const minimumStock =
        Number(
          newIngredient.minimumStock,
        );

      const unitCost =
        Number(
          newIngredient.unitCost,
        );

      const targetStock =
        Number(
          newIngredient.targetStock,
        );

      const purchaseUnitFactor =
        Number(
          newIngredient
            .purchaseUnitFactor,
        );

      if (
        !newIngredient.name.trim() ||
        !Number.isFinite(stock) ||
        stock < 0 ||
        !Number.isFinite(
          minimumStock,
        ) ||
        minimumStock < 0 ||
        !Number.isFinite(
          unitCost,
        ) ||
        unitCost < 0
        || !Number.isFinite(
          targetStock,
        )
        || targetStock < 0
        || !Number.isFinite(
          purchaseUnitFactor,
        )
        || purchaseUnitFactor <= 0
      ) {
        setError(
          "Revisá los datos del nuevo insumo.",
        );

        return;
      }

      setCreating(true);
      setError(null);

      try {
        const created =
          await createAdminIngredient(
            token,
            {
              name:
                newIngredient.name.trim(),

              unit:
                newIngredient.unit,

              stock,

              minimumStock,

              targetStock,

              unitCost,

              purchaseUnitLabel:
                newIngredient
                  .purchaseUnitLabel
                  .trim() ||
                undefined,

              purchaseUnitFactor,

              category:
                newIngredient.category
                  .trim() ||
                undefined,

              storageLocation:
                newIngredient
                  .storageLocation
                  .trim() ||
                undefined,

              trackExpiration:
                newIngredient
                  .trackExpiration,

              active: true,

              order:
                ingredients.length,
            },
          );

        setIngredients(
          (
            currentIngredients,
          ) => [
            ...currentIngredients,
            created,
          ],
        );

        if (
          created.stock > 0
        ) {
          const updatedMovements =
            await getAdminInventoryMovements(
              token,
              30,
            );

          setMovements(
            updatedMovements,
          );
        }

        setNewIngredient({
          name: "",
          unit: "unit",
          stock: "0",
          minimumStock: "0",
          targetStock: "0",
          unitCost: "0",
          purchaseUnitLabel: "",
          purchaseUnitFactor: "1",
          category: "",
          storageLocation: "",
          trackExpiration: false,
        });
      } catch (createError) {
        setError(
          createError instanceof Error
            ? createError.message
            : "No se pudo crear el insumo.",
        );
      } finally {
        setCreating(false);
      }
    };

  /* ========================================
     EDITAR INSUMO
  ======================================== */

  const openEdit = (
    ingredient:
      AdminIngredient,
  ) => {
    setEditingIngredient(
      ingredient,
    );

    setEditForm({
      name:
        ingredient.name,

      unit:
        ingredient.unit,

      minimumStock:
        String(
          ingredient.minimumStock,
        ),

      targetStock:
        String(
          ingredient.targetStock ??
            ingredient.minimumStock,
        ),

      unitCost:
        String(
          ingredient.unitCost,
        ),

      purchaseUnitLabel:
        ingredient.purchaseUnitLabel ??
        "",

      purchaseUnitFactor:
        String(
          ingredient.purchaseUnitFactor ??
            1,
        ),

      category:
        ingredient.category ??
        "",

      storageLocation:
        ingredient.storageLocation ??
        "",

      trackExpiration:
        ingredient.trackExpiration ??
        false,

      active:
        ingredient.active,
    });
  };

  const handleEditIngredient =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (
        !token ||
        !editingIngredient
      ) {
        return;
      }

      const minimumStock =
        Number(
          editForm.minimumStock,
        );

      const unitCost =
        Number(
          editForm.unitCost,
        );

      const targetStock =
        Number(
          editForm.targetStock,
        );

      const purchaseUnitFactor =
        Number(
          editForm
            .purchaseUnitFactor,
        );

      if (
        !editForm.name.trim() ||
        !Number.isFinite(
          minimumStock,
        ) ||
        minimumStock < 0 ||
        !Number.isFinite(
          unitCost,
        ) ||
        unitCost < 0
        || !Number.isFinite(
          targetStock,
        )
        || targetStock < 0
        || !Number.isFinite(
          purchaseUnitFactor,
        )
        || purchaseUnitFactor <= 0
      ) {
        setError(
          "Revisá los datos del insumo.",
        );

        return;
      }

      setSavingEdit(true);
      setError(null);

      try {
        const updated =
          await updateAdminIngredient(
            editingIngredient._id,
            token,
            {
              name:
                editForm.name.trim(),

              unit:
                editForm.unit,

              minimumStock,

              targetStock,

              unitCost,

              purchaseUnitLabel:
                editForm
                  .purchaseUnitLabel
                  .trim() ||
                undefined,

              purchaseUnitFactor,

              category:
                editForm.category
                  .trim() ||
                undefined,

              storageLocation:
                editForm
                  .storageLocation
                  .trim() ||
                undefined,

              trackExpiration:
                editForm
                  .trackExpiration,

              active:
                editForm.active,
            },
          );

        setIngredients(
          (
            currentIngredients,
          ) =>
            currentIngredients.map(
              (ingredient) =>
                ingredient._id ===
                updated._id
                  ? updated
                  : ingredient,
            ),
        );

        setEditingIngredient(
          null,
        );
      } catch (editError) {
        setError(
          editError instanceof Error
            ? editError.message
            : "No se pudo actualizar el insumo.",
        );
      } finally {
        setSavingEdit(false);
      }
    };

  /* ========================================
     MOVIMIENTO
  ======================================== */

  const openMovement = (
    ingredient:
      AdminIngredient,
    mode:
      MovementMode,
  ) => {
    setMovingIngredient(
      ingredient,
    );

    setMovementForm({
      mode,
      value:
        mode ===
        "adjustment"
          ? String(
              ingredient.stock,
            )
          : "",
      note: "",
      batchNumber: "",
      expirationDate: "",
    });
  };

  const handleMovement =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (
        !token ||
        !movingIngredient
      ) {
        return;
      }

      const value =
        Number(
          movementForm.value,
        );

      if (
        !Number.isFinite(
          value,
        ) ||
        (
          movementForm.mode ===
            "adjustment"
            ? value < 0
            : value <= 0
        )
      ) {
        setError(
          movementForm.mode ===
          "adjustment"
            ? "El nuevo stock debe ser cero o mayor."
            : "La cantidad debe ser mayor a cero.",
        );

        return;
      }

      setSavingMovement(true);
      setError(null);

      try {
        const result =
          await createAdminInventoryMovement(
            movingIngredient._id,
            token,
            movementForm.mode ===
            "adjustment"
              ? {
                  type:
                    "adjustment",
                  newStock:
                    value,
                  note:
                    movementForm.note.trim() ||
                    undefined,
                }
              : {
                  type:
                    movementForm.mode,
                  quantity:
                    value,
                  note:
                    movementForm.note.trim() ||
                    undefined,
                  batchNumber:
                    movementForm.batchNumber
                      .trim() ||
                    undefined,
                  expirationDate:
                    movementForm.expirationDate ||
                    undefined,
                },
          );

        setIngredients(
          (
            currentIngredients,
          ) =>
            currentIngredients.map(
              (ingredient) =>
                ingredient._id ===
                result.ingredient._id
                  ? result.ingredient
                  : ingredient,
            ),
        );

        setMovements(
          (
            currentMovements,
          ) => [
            result.movement,
            ...currentMovements,
          ].slice(
            0,
            30,
          ),
        );

        setMovingIngredient(
          null,
        );
      } catch (movementError) {
        setError(
          movementError instanceof Error
            ? movementError.message
            : "No se pudo registrar el movimiento.",
        );
      } finally {
        setSavingMovement(false);
      }
    };

  /* ========================================
     VISTA
  ======================================== */

  return (
    <main className="admin-dashboard">
      <div className="admin-dashboard__container">

        <header className="admin-dashboard__header">
          <div>
            <span className="admin-dashboard__eyebrow">
              Loongis
            </span>

            <h1>
              Panel administrador
            </h1>

            <p>
              Sesión iniciada como{" "}
              <strong>
                {admin.email}
              </strong>
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
              onClick={
                handleLogout
              }
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <nav
          className="admin-dashboard__nav"
          aria-label="Secciones del panel administrador"
        >
          <Link
            to="/admin"
            className="admin-dashboard__nav-link"
          >
            Productos
          </Link>

          <Link
            to="/admin/pedidos"
            className="admin-dashboard__nav-link"
          >
            Pedidos
          </Link>

          <Link
            to="/admin/inventario"
            className="admin-dashboard__nav-link admin-dashboard__nav-link--active"
            aria-current="page"
          >
            Inventario
          </Link>

          {admin.role === "owner" && (
          <Link
            to="/admin/recetas"
            className="admin-dashboard__nav-link"
          >
            Recetas
          </Link>
          )}

          <Link
            to="/admin/stock"
            className="admin-dashboard__nav-link"
          >
            Centro de stock
          </Link>

          {admin.role === "owner" && (
            <Link
              to="/admin/usuarios"
              className="admin-dashboard__nav-link"
            >
              Accesos
            </Link>
          )}
        </nav>

        {error && (
          <div
            className="admin-inventory__error"
            role="alert"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="admin-inventory__loading">
            Cargando inventario...
          </div>
        ) : (
          <>
            <section className="admin-inventory__summary">
              <article>
                <span>
                  Insumos activos
                </span>

                <strong>
                  {
                    activeIngredients.length
                  }
                </strong>
              </article>

              <article>
                <span>
                  Stock bajo
                </span>

                <strong>
                  {
                    lowStockCount
                  }
                </strong>
              </article>

              <article>
                <span>
                  Sin stock
                </span>

                <strong>
                  {
                    outOfStockCount
                  }
                </strong>
              </article>

              {admin.role === "owner" && (
                <article>
                  <span>
                    Valor estimado
                  </span>

                  <strong>
                    {
                      currencyFormatter.format(
                        inventoryValue,
                      )
                    }
                  </strong>
                </article>
              )}
            </section>

            <section className="admin-inventory__panel">
              <header className="admin-inventory__section-header">
                <div>
                  <span className="admin-inventory__eyebrow">
                    Stock
                  </span>

                  <h2>
                    Inventario
                  </h2>

                  <p>
                    Cargá insumos, registrá reposiciones, mermas y ajustes.
                  </p>
                </div>

                <button
                  type="button"
                  className="admin-inventory__refresh"
                  onClick={() =>
                    void handleRefresh()
                  }
                  disabled={
                    refreshing
                  }
                >
                  {refreshing
                    ? "Actualizando..."
                    : "Actualizar"}
                </button>
              </header>

              {admin.role ===
                "owner" && (
              <form
                className="admin-inventory__create"
                onSubmit={
                  handleCreateIngredient
                }
              >
                <h3>
                  Nuevo insumo
                </h3>

                <div className="admin-inventory__create-grid">
                  <label>
                    <span>
                      Nombre
                    </span>

                    <input
                      type="text"
                      value={
                        newIngredient.name
                      }
                      onChange={(
                        event,
                      ) =>
                        setNewIngredient(
                          (
                            current,
                          ) => ({
                            ...current,
                            name:
                              event.target.value,
                          }),
                        )
                      }
                      placeholder="Ej. Pan brioche"
                      required
                    />
                  </label>

                  <label>
                    <span>
                      Unidad
                    </span>

                    <select
                      value={
                        newIngredient.unit
                      }
                      onChange={(
                        event,
                      ) =>
                        setNewIngredient(
                          (
                            current,
                          ) => ({
                            ...current,
                            unit:
                              event.target.value as AdminIngredientUnit,
                          }),
                        )
                      }
                    >
                      <option value="unit">
                        Unidad
                      </option>
                      <option value="portion">
                        Porción
                      </option>
                      <option value="gram">
                        Gramo
                      </option>
                      <option value="kilogram">
                        Kilogramo
                      </option>
                      <option value="milliliter">
                        Mililitro
                      </option>
                      <option value="liter">
                        Litro
                      </option>
                    </select>
                  </label>

                  <label>
                    <span>
                      Stock inicial
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        newIngredient.stock
                      }
                      onChange={(
                        event,
                      ) =>
                        setNewIngredient(
                          (
                            current,
                          ) => ({
                            ...current,
                            stock:
                              event.target.value,
                          }),
                        )
                      }
                      required
                    />
                  </label>

                  <label>
                    <span>
                      Stock mínimo
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        newIngredient.minimumStock
                      }
                      onChange={(
                        event,
                      ) =>
                        setNewIngredient(
                          (
                            current,
                          ) => ({
                            ...current,
                            minimumStock:
                              event.target.value,
                          }),
                        )
                      }
                      required
                    />
                  </label>

                  <label>
                    <span>
                      Costo por unidad
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        newIngredient.unitCost
                      }
                      onChange={(
                        event,
                      ) =>
                        setNewIngredient(
                          (
                            current,
                          ) => ({
                            ...current,
                            unitCost:
                              event.target.value,
                          }),
                        )
                      }
                      required
                    />
                  </label>

                  <label>
                    <span>
                      Stock objetivo
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        newIngredient.targetStock
                      }
                      onChange={(event) =>
                        setNewIngredient((current) => ({
                          ...current,
                          targetStock: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>

                  <label>
                    <span>
                      Presentación de compra
                    </span>

                    <input
                      type="text"
                      value={
                        newIngredient.purchaseUnitLabel
                      }
                      onChange={(event) =>
                        setNewIngredient((current) => ({
                          ...current,
                          purchaseUnitLabel: event.target.value,
                        }))
                      }
                      placeholder="Ej. bolsa, caja"
                    />
                  </label>

                  <label>
                    <span>
                      Unidades base por presentación
                    </span>

                    <input
                      type="number"
                      min="0.000001"
                      step="0.01"
                      value={
                        newIngredient.purchaseUnitFactor
                      }
                      onChange={(event) =>
                        setNewIngredient((current) => ({
                          ...current,
                          purchaseUnitFactor: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>

                  <label>
                    <span>
                      Categoría
                    </span>

                    <input
                      type="text"
                      value={
                        newIngredient.category
                      }
                      onChange={(event) =>
                        setNewIngredient((current) => ({
                          ...current,
                          category: event.target.value,
                        }))
                      }
                      placeholder="Opcional"
                    />
                  </label>

                  <label>
                    <span>
                      Ubicación
                    </span>

                    <input
                      type="text"
                      value={
                        newIngredient.storageLocation
                      }
                      onChange={(event) =>
                        setNewIngredient((current) => ({
                          ...current,
                          storageLocation: event.target.value,
                        }))
                      }
                      placeholder="Ej. freezer 1"
                    />
                  </label>

                  <label className="admin-inventory-modal__checkbox">
                    <input
                      type="checkbox"
                      checked={
                        newIngredient.trackExpiration
                      }
                      onChange={(event) =>
                        setNewIngredient((current) => ({
                          ...current,
                          trackExpiration: event.target.checked,
                        }))
                      }
                    />
                    <span>
                      Controlar vencimientos
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="admin-inventory__create-button"
                  disabled={
                    creating
                  }
                >
                  {creating
                    ? "Creando..."
                    : "+ Crear insumo"}
                </button>
              </form>
              )}

              <div className="admin-inventory__list">
                {ingredients.length ===
                0 ? (
                  <div className="admin-inventory__empty">
                    Todavía no hay insumos cargados.
                  </div>
                ) : (
                  ingredients.map(
                    (
                      ingredient,
                    ) => {
                      const isOut =
                        ingredient.active &&
                        ingredient.stock ===
                          0;

                      const isLow =
                        ingredient.active &&
                        ingredient.stock >
                          0 &&
                        ingredient.stock <=
                          ingredient.minimumStock;

                      return (
                        <article
                          key={
                            ingredient._id
                          }
                          className={[
                            "admin-inventory-item",
                            !ingredient.active
                              ? "admin-inventory-item--inactive"
                              : "",
                            isOut
                              ? "admin-inventory-item--out"
                              : "",
                            isLow
                              ? "admin-inventory-item--low"
                              : "",
                          ]
                            .filter(
                              Boolean,
                            )
                            .join(
                              " ",
                            )}
                        >
                          <div className="admin-inventory-item__main">
                            <div>
                              <span className="admin-inventory-item__unit">
                                {
                                  getUnitLabel(
                                    ingredient.unit,
                                  )
                                }
                              </span>

                              <h3>
                                {
                                  ingredient.name
                                }
                              </h3>

                              <p>
                                Mínimo:{" "}
                                {numberFormatter.format(
                                  ingredient.minimumStock,
                                )}{" "}
                                {getUnitLabel(
                                  ingredient.unit,
                                )}
                                {admin.role === "owner" && (
                                  <>
                                    {" · "}
                                    Costo:{" "}
                                    {currencyFormatter.format(
                                      ingredient.unitCost,
                                    )}
                                  </>
                                )}
                              </p>
                            </div>

                            <div className="admin-inventory-item__stock">
                              <strong>
                                {
                                  numberFormatter.format(
                                    ingredient.stock,
                                  )
                                }
                              </strong>

                              <span>
                                {
                                  getUnitLabel(
                                    ingredient.unit,
                                  )
                                }
                              </span>

                              {isOut && (
                                <em>
                                  Sin stock
                                </em>
                              )}

                              {isLow && (
                                <em>
                                  Stock bajo
                                </em>
                              )}

                              {!ingredient.active && (
                                <em>
                                  Inactivo
                                </em>
                              )}
                            </div>
                          </div>

                          <div className="admin-inventory-item__actions">
                            <button
                              type="button"
                              onClick={() =>
                                openMovement(
                                  ingredient,
                                  "restock",
                                )
                              }
                            >
                              + Reponer
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openMovement(
                                  ingredient,
                                  "waste",
                                )
                              }
                              disabled={
                                ingredient.stock <=
                                0
                              }
                            >
                              − Merma
                            </button>

                            {admin.role ===
                              "owner" && (
                            <button
                              type="button"
                              onClick={() =>
                                openMovement(
                                  ingredient,
                                  "adjustment",
                                )
                              }
                            >
                              Ajustar
                            </button>
                            )}

                            {admin.role ===
                              "owner" && (
                            <button
                              type="button"
                              onClick={() =>
                                openEdit(
                                  ingredient,
                                )
                              }
                            >
                              Editar
                            </button>
                            )}
                          </div>
                        </article>
                      );
                    },
                  )
                )}
              </div>
            </section>

            <section className="admin-inventory__history">
              <header>
                <div>
                  <span className="admin-inventory__eyebrow">
                    Auditoría
                  </span>

                  <h2>
                    Últimos movimientos
                  </h2>
                </div>
              </header>

              <div className="admin-inventory__history-filters">
                <select
                  value={historyIngredient}
                  onChange={(event) => setHistoryIngredient(event.target.value)}
                  aria-label="Filtrar por insumo"
                >
                  <option value="">Todos los insumos</option>
                  {ingredients.map((ingredient) => (
                    <option key={ingredient._id} value={ingredient._id}>
                      {ingredient.name}
                    </option>
                  ))}
                </select>

                <select
                  value={historyType}
                  onChange={(event) => setHistoryType(event.target.value as AdminInventoryMovementType | "")}
                  aria-label="Filtrar por movimiento"
                >
                  <option value="">Todos los movimientos</option>
                  <option value="initial">Stock inicial</option>
                  <option value="restock">Reposición</option>
                  <option value="waste">Merma</option>
                  <option value="adjustment">Ajuste</option>
                  <option value="sale">Venta</option>
                  <option value="reversal">Reintegro</option>
                </select>

                <input type="date" value={historyFrom} onChange={(event) => setHistoryFrom(event.target.value)} aria-label="Fecha desde" />
                <input type="date" value={historyTo} onChange={(event) => setHistoryTo(event.target.value)} aria-label="Fecha hasta" />
                <button type="button" onClick={() => void applyHistoryFilters()} disabled={refreshing}>
                  Aplicar filtros
                </button>
                <button type="button" onClick={exportHistory} disabled={movements.length === 0}>
                  Exportar CSV
                </button>
              </div>

              {movements.length ===
              0 ? (
                <div className="admin-inventory__empty">
                  Todavía no hay movimientos.
                </div>
              ) : (
                <div className="admin-inventory__history-list">
                  {movements.map(
                    (
                      movement,
                    ) => (
                      <article
                        key={
                          movement._id
                        }
                        className="admin-inventory-movement"
                      >
                        <div>
                          <strong>
                            {
                              getIngredientName(
                                movement,
                              )
                            }
                          </strong>

                          <span>
                            {
                              getMovementLabel(
                                movement.type,
                              )
                            }
                            {" · "}
                            {
                              formatDate(
                                movement.createdAt,
                              )
                            }
                          </span>

                          {movement.note && (
                            <small>
                              {
                                movement.note
                              }
                            </small>
                          )}

                          {movement.performedByEmail && (
                            <small>
                              Registrado por {movement.performedByEmail}
                            </small>
                          )}
                        </div>

                        <div className="admin-inventory-movement__numbers">
                          <strong
                            className={
                              movement.change >
                              0
                                ? "admin-inventory-movement__change admin-inventory-movement__change--positive"
                                : "admin-inventory-movement__change admin-inventory-movement__change--negative"
                            }
                          >
                            {movement.change >
                            0
                              ? "+"
                              : ""}
                            {
                              numberFormatter.format(
                                movement.change,
                              )
                            }
                          </strong>

                          <span>
                            {
                              numberFormatter.format(
                                movement.previousStock,
                              )
                            }
                            {" → "}
                            {
                              numberFormatter.format(
                                movement.newStock,
                              )
                            }
                          </span>
                        </div>
                      </article>
                    ),
                  )}
                </div>
              )}
            </section>
          </>
        )}

        {editingIngredient && (
          <div
            className="admin-inventory-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-ingredient-title"
          >
            <div className="admin-inventory-modal__card">
              <h2 id="edit-ingredient-title">
                Editar insumo
              </h2>

              <p>
                {
                  editingIngredient.name
                }
              </p>

              <form
                onSubmit={
                  handleEditIngredient
                }
              >
                <label>
                  <span>
                    Nombre
                  </span>

                  <input
                    type="text"
                    value={
                      editForm.name
                    }
                    onChange={(
                      event,
                    ) =>
                      setEditForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          name:
                            event.target.value,
                        }),
                      )
                    }
                    required
                  />
                </label>

                <label>
                  <span>
                    Unidad
                  </span>

                  <select
                    value={
                      editForm.unit
                    }
                    onChange={(
                      event,
                    ) =>
                      setEditForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          unit:
                            event.target.value as AdminIngredientUnit,
                        }),
                      )
                    }
                  >
                    <option value="unit">
                      Unidad
                    </option>
                    <option value="portion">
                      Porción
                    </option>
                    <option value="gram">
                      Gramo
                    </option>
                    <option value="kilogram">
                      Kilogramo
                    </option>
                    <option value="milliliter">
                      Mililitro
                    </option>
                    <option value="liter">
                      Litro
                    </option>
                  </select>
                </label>

                <label>
                  <span>
                    Stock mínimo
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      editForm.minimumStock
                    }
                    onChange={(
                      event,
                    ) =>
                      setEditForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          minimumStock:
                            event.target.value,
                        }),
                      )
                    }
                    required
                  />
                </label>

                <label>
                  <span>
                    Costo por unidad
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      editForm.unitCost
                    }
                    onChange={(
                      event,
                    ) =>
                      setEditForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          unitCost:
                            event.target.value,
                        }),
                      )
                    }
                    required
                  />
                </label>

                <label>
                  <span>
                    Stock objetivo
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.targetStock}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        targetStock: event.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <label>
                  <span>
                    Presentación de compra
                  </span>

                  <input
                    type="text"
                    value={editForm.purchaseUnitLabel}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        purchaseUnitLabel: event.target.value,
                      }))
                    }
                    placeholder="Ej. bolsa, caja"
                  />
                </label>

                <label>
                  <span>
                    Unidades base por presentación
                  </span>

                  <input
                    type="number"
                    min="0.000001"
                    step="0.01"
                    value={editForm.purchaseUnitFactor}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        purchaseUnitFactor: event.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <label>
                  <span>
                    Categoría
                  </span>

                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  <span>
                    Ubicación
                  </span>

                  <input
                    type="text"
                    value={editForm.storageLocation}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        storageLocation: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="admin-inventory-modal__checkbox">
                  <input
                    type="checkbox"
                    checked={editForm.trackExpiration}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        trackExpiration: event.target.checked,
                      }))
                    }
                  />
                  <span>
                    Controlar vencimientos
                  </span>
                </label>

                <label className="admin-inventory-modal__checkbox">
                  <input
                    type="checkbox"
                    checked={
                      editForm.active
                    }
                    onChange={(
                      event,
                    ) =>
                      setEditForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          active:
                            event.target.checked,
                        }),
                      )
                    }
                  />

                  <span>
                    Insumo activo
                  </span>
                </label>

                <div className="admin-inventory-modal__actions">
                  <button
                    type="button"
                    className="admin-inventory-modal__secondary"
                    onClick={() =>
                      setEditingIngredient(
                        null,
                      )
                    }
                    disabled={
                      savingEdit
                    }
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="admin-inventory-modal__primary"
                    disabled={
                      savingEdit
                    }
                  >
                    {savingEdit
                      ? "Guardando..."
                      : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {movingIngredient && (
          <div
            className="admin-inventory-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="movement-title"
          >
            <div className="admin-inventory-modal__card">
              <h2 id="movement-title">
                {movementForm.mode ===
                "restock"
                  ? "Registrar reposición"
                  : movementForm.mode ===
                      "waste"
                    ? "Registrar merma"
                    : "Ajustar stock"}
              </h2>

              <p>
                {
                  movingIngredient.name
                }
                {" · "}
                Stock actual:{" "}
                {
                  numberFormatter.format(
                    movingIngredient.stock,
                  )
                }{" "}
                {
                  getUnitLabel(
                    movingIngredient.unit,
                  )
                }
              </p>

              <form
                onSubmit={
                  handleMovement
                }
              >
                <label>
                  <span>
                    {movementForm.mode ===
                    "adjustment"
                      ? "Nuevo stock"
                      : "Cantidad"}
                  </span>

                  <input
                    type="number"
                    min={
                      movementForm.mode ===
                      "adjustment"
                        ? "0"
                        : "0.01"
                    }
                    step="0.01"
                    value={
                      movementForm.value
                    }
                    onChange={(
                      event,
                    ) =>
                      setMovementForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          value:
                            event.target.value,
                        }),
                      )
                    }
                    required
                  />
                </label>

                <label>
                  <span>
                    Nota
                  </span>

                  <textarea
                    rows={3}
                    value={
                      movementForm.note
                    }
                    onChange={(
                      event,
                    ) =>
                      setMovementForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          note:
                            event.target.value,
                        }),
                      )
                    }
                    placeholder="Opcional"
                  />
                </label>

                {movementForm.mode ===
                  "restock" && (
                  <>
                    <label>
                      <span>
                        Lote
                      </span>

                      <input
                        type="text"
                        value={
                          movementForm.batchNumber
                        }
                        onChange={(
                          event,
                        ) =>
                          setMovementForm(
                            (
                              current,
                            ) => ({
                              ...current,
                              batchNumber:
                                event.target.value,
                            }),
                          )
                        }
                        placeholder="Opcional"
                      />
                    </label>

                    <label>
                      <span>
                        Vencimiento
                      </span>

                      <input
                        type="date"
                        value={
                          movementForm.expirationDate
                        }
                        onChange={(
                          event,
                        ) =>
                          setMovementForm(
                            (
                              current,
                            ) => ({
                              ...current,
                              expirationDate:
                                event.target.value,
                            }),
                          )
                        }
                      />
                    </label>
                  </>
                )}

                <div className="admin-inventory-modal__actions">
                  <button
                    type="button"
                    className="admin-inventory-modal__secondary"
                    onClick={() =>
                      setMovingIngredient(
                        null,
                      )
                    }
                    disabled={
                      savingMovement
                    }
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="admin-inventory-modal__primary"
                    disabled={
                      savingMovement
                    }
                  >
                    {savingMovement
                      ? "Guardando..."
                      : "Registrar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
