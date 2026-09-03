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
  getAdminInventorySettings,
  updateAdminInventorySettings,
} from "../services/adminInventoryApi";

import type {
  AdminIngredient,
  AdminInventorySettings,
} from "../services/adminInventoryApi";

import {
  getAdminProducts,
} from "../services/adminProductsApi";

import type {
  AdminProduct,
  AdminProductOption,
} from "../services/adminProductsApi";

import {
  getAdminRecipes,
  getRecipeIngredientId,
  getRecipeProductId,
  saveAdminRecipe,
} from "../services/adminRecipesApi";

import type {
  AdminProductRecipe,
} from "../services/adminRecipesApi";

import {
  getAdminToken,
  removeAdminToken,
} from "../utils/adminSession";

import "../styles/AdminDashboard.css";
import "../styles/AdminRecipes.css";

/* ========================================
   TIPOS DE FORMULARIO
======================================== */

type BaseRow = {
  ingredient:
    string;

  quantity:
    string;

  removableIngredient:
    string;
};

type ModifierRow = {
  ingredient:
    string;

  quantity:
    string;
};

type OptionModifierForm = {
  optionId:
    string;

  items:
    ModifierRow[];
};

type RecipeForm = {
  active:
    boolean;

  baseItems:
    BaseRow[];

  sizeModifiers:
    OptionModifierForm[];

  extraModifiers:
    OptionModifierForm[];
};

/* ========================================
   HELPERS
======================================== */

function emptyForm():
  RecipeForm {
  return {
    active:
      true,

    baseItems:
      [],

    sizeModifiers:
      [],

    extraModifiers:
      [],
  };
}

function getIngredientId(
  value:
    AdminProductRecipe["baseItems"][number]["ingredient"],
): string {
  return getRecipeIngredientId(
    value,
  );
}

function recipeToForm(
  recipe:
    AdminProductRecipe | undefined,
): RecipeForm {
  if (!recipe) {
    return emptyForm();
  }

  return {
    active:
      recipe.active,

    baseItems:
      recipe.baseItems.map(
        (item) => ({
          ingredient:
            getIngredientId(
              item.ingredient,
            ),

          quantity:
            String(
              item.quantity,
            ),

          removableIngredient:
            item.removableIngredient ??
            "",
        }),
      ),

    sizeModifiers:
      recipe.sizeModifiers.map(
        (modifier) => ({
          optionId:
            modifier.optionId,

          items:
            modifier.items.map(
              (item) => ({
                ingredient:
                  getRecipeIngredientId(
                    item.ingredient,
                  ),

                quantity:
                  String(
                    item.quantity,
                  ),
              }),
            ),
        }),
      ),

    extraModifiers:
      recipe.extraModifiers.map(
        (modifier) => ({
          optionId:
            modifier.optionId,

          items:
            modifier.items.map(
              (item) => ({
                ingredient:
                  getRecipeIngredientId(
                    item.ingredient,
                  ),

                quantity:
                  String(
                    item.quantity,
                  ),
              }),
            ),
        }),
      ),
  };
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

function getProductRecipe(
  recipes:
    AdminProductRecipe[],
  productId:
    string,
): AdminProductRecipe | undefined {
  return recipes.find(
    (recipe) =>
      getRecipeProductId(
        recipe.product,
      ) ===
      productId,
  );
}

function getOptionModifier(
  modifiers:
    OptionModifierForm[],
  optionId:
    string,
): OptionModifierForm | undefined {
  return modifiers.find(
    (modifier) =>
      modifier.optionId ===
      optionId,
  );
}

function getOptionLabel(
  option:
    AdminProductOption,
): string {
  return (
    option.label ||
    option.name
  );
}

/* ========================================
   COMPONENTE
======================================== */

export function AdminRecipes() {
  const navigate =
    useNavigate();

  const {
    admin,
  } =
    useOutletContext<ProtectedAdminOutletContext>();

  const token =
    getAdminToken();

  const [
    products,
    setProducts,
  ] =
    useState<AdminProduct[]>(
      [],
    );

  const [
    ingredients,
    setIngredients,
  ] =
    useState<AdminIngredient[]>(
      [],
    );

  const [
    recipes,
    setRecipes,
  ] =
    useState<
      AdminProductRecipe[]
    >([]);

  const [
    inventorySettings,
    setInventorySettings,
  ] =
    useState<AdminInventorySettings | null>(
      null,
    );

  const [
    selectedProductId,
    setSelectedProductId,
  ] =
    useState("");

  const [
    form,
    setForm,
  ] =
    useState<RecipeForm>(
      emptyForm,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
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
    success,
    setSuccess,
  ] =
    useState(false);

  const [
    updatingTracking,
    setUpdatingTracking,
  ] =
    useState(false);

  const [
    trackingMessage,
    setTrackingMessage,
  ] =
    useState<string | null>(
      null,
    );

  /* ========================================
     CARGA
  ======================================== */

  useEffect(() => {
    if (!token) {
      return;
    }

    const currentToken =
      token;

    let cancelled =
      false;

    async function loadData() {
      try {
        const [
          productsData,
          ingredientsData,
          recipesData,
          inventorySettingsData,
        ] =
          await Promise.all([
            getAdminProducts(),

            getAdminIngredients(
              currentToken,
            ),

            getAdminRecipes(
              currentToken,
            ),

            getAdminInventorySettings(
              currentToken,
            ),
          ]);

        if (cancelled) {
          return;
        }

        setProducts(
          productsData,
        );

        setIngredients(
          ingredientsData,
        );

        setRecipes(
          recipesData,
        );

        setInventorySettings(
          inventorySettingsData,
        );

        const firstProduct =
          productsData[0];

        if (firstProduct) {
          const firstRecipe =
            getProductRecipe(
              recipesData,
              firstProduct._id,
            );

          setSelectedProductId(
            firstProduct._id,
          );

          setForm(
            recipeToForm(
              firstRecipe,
            ),
          );
        }

        setError(null);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        const message =
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar las recetas.";

        if (
          isAuthError(
            message,
          )
        ) {
          removeAdminToken();

          navigate(
            "/admin/login",
            {
              replace:
                true,
            },
          );

          return;
        }

        setError(
          message,
        );
      } finally {
        if (!cancelled) {
          setLoading(
            false,
          );
        }
      }
    }

    void loadData();

    return () => {
      cancelled =
        true;
    };
  }, [
    navigate,
    token,
  ]);

  /* ========================================
     DERIVADOS
  ======================================== */

  const selectedProduct =
    products.find(
      (product) =>
        product._id ===
        selectedProductId,
    ) ?? null;

  const activeIngredients =
    useMemo(
      () =>
        ingredients.filter(
          (ingredient) =>
            ingredient.active,
        ),
      [ingredients],
    );

  const configuredCount =
    useMemo(
      () =>
        recipes.filter(
          (recipe) =>
            recipe.active &&
            recipe.baseItems.length >
              0,
        ).length,
      [recipes],
    );

  const canEnableTracking =
    activeIngredients.length >
      0 &&
    configuredCount > 0;

  /* ========================================
     SESIÓN
  ======================================== */

  const handleLogout = () => {
    removeAdminToken();

    navigate(
      "/admin/login",
      {
        replace:
          true,
      },
    );
  };

  /* ========================================
     CONTROL DE INVENTARIO
  ======================================== */

  const handleTrackingToggle =
    async () => {
      if (
        !token ||
        !inventorySettings
      ) {
        return;
      }

      const nextEnabled =
        !inventorySettings.enabled;

      const confirmationMessage =
        nextEnabled
          ? "Activá el descuento automático únicamente cuando el dueño haya cargado y revisado el stock y las recetas reales. ¿Querés activarlo ahora?"
          : "Mientras esté pausado, los pedidos podrán confirmarse pero no descontarán insumos. ¿Querés pausarlo?";

      if (
        !window.confirm(
          confirmationMessage,
        )
      ) {
        return;
      }

      setUpdatingTracking(
        true,
      );

      setError(
        null,
      );

      setSuccess(
        false,
      );

      setTrackingMessage(
        null,
      );

      try {
        const updated =
          await updateAdminInventorySettings(
            token,
            nextEnabled,
          );

        setInventorySettings(
          updated,
        );

        setTrackingMessage(
          updated.enabled
            ? "Descuento automático activado."
            : "Descuento automático pausado.",
        );
      } catch (updateError) {
        const message =
          updateError instanceof Error
            ? updateError.message
            : "No se pudo actualizar el control de inventario.";

        if (
          isAuthError(
            message,
          )
        ) {
          removeAdminToken();

          navigate(
            "/admin/login",
            {
              replace:
                true,
            },
          );

          return;
        }

        setError(
          message,
        );
      } finally {
        setUpdatingTracking(
          false,
        );
      }
    };

  /* ========================================
     CAMBIAR PRODUCTO
  ======================================== */

  const handleSelectProduct = (
    productId:
      string,
  ) => {
    setSelectedProductId(
      productId,
    );

    setSuccess(
      false,
    );

    setTrackingMessage(
      null,
    );

    setError(
      null,
    );

    setForm(
      recipeToForm(
        getProductRecipe(
          recipes,
          productId,
        ),
      ),
    );
  };

  /* ========================================
     BASE
  ======================================== */

  const addBaseRow = () => {
    setForm(
      (
        current,
      ) => ({
        ...current,

        baseItems: [
          ...current.baseItems,

          {
            ingredient:
              "",

            quantity:
              "1",

            removableIngredient:
              "",
          },
        ],
      }),
    );
  };

  const updateBaseRow = (
    index:
      number,
    patch:
      Partial<BaseRow>,
  ) => {
    setForm(
      (
        current,
      ) => ({
        ...current,

        baseItems:
          current.baseItems.map(
            (
              item,
              currentIndex,
            ) =>
              currentIndex ===
              index
                ? {
                    ...item,
                    ...patch,
                  }
                : item,
          ),
      }),
    );
  };

  const removeBaseRow = (
    index:
      number,
  ) => {
    setForm(
      (
        current,
      ) => ({
        ...current,

        baseItems:
          current.baseItems.filter(
            (
              _item,
              currentIndex,
            ) =>
              currentIndex !==
              index,
          ),
      }),
    );
  };

  /* ========================================
     MODIFICADORES
  ======================================== */

  const addModifierRow = (
    type:
      | "sizeModifiers"
      | "extraModifiers",
    optionId:
      string,
  ) => {
    setForm(
      (
        current,
      ) => {
        const currentModifiers =
          current[type];

        const existing =
          getOptionModifier(
            currentModifiers,
            optionId,
          );

        const nextRow:
          ModifierRow = {
          ingredient:
            "",

          quantity:
            type ===
            "sizeModifiers"
              ? "1"
              : "1",
        };

        if (existing) {
          return {
            ...current,

            [type]:
              currentModifiers.map(
                (
                  modifier,
                ) =>
                  modifier.optionId ===
                  optionId
                    ? {
                        ...modifier,

                        items: [
                          ...modifier.items,
                          nextRow,
                        ],
                      }
                    : modifier,
              ),
          };
        }

        return {
          ...current,

          [type]: [
            ...currentModifiers,

            {
              optionId,
              items: [
                nextRow,
              ],
            },
          ],
        };
      },
    );
  };

  const updateModifierRow = (
    type:
      | "sizeModifiers"
      | "extraModifiers",
    optionId:
      string,
    index:
      number,
    patch:
      Partial<ModifierRow>,
  ) => {
    setForm(
      (
        current,
      ) => ({
        ...current,

        [type]:
          current[type].map(
            (
              modifier,
            ) =>
              modifier.optionId ===
              optionId
                ? {
                    ...modifier,

                    items:
                      modifier.items.map(
                        (
                          item,
                          currentIndex,
                        ) =>
                          currentIndex ===
                          index
                            ? {
                                ...item,
                                ...patch,
                              }
                            : item,
                      ),
                  }
                : modifier,
          ),
      }),
    );
  };

  const removeModifierRow = (
    type:
      | "sizeModifiers"
      | "extraModifiers",
    optionId:
      string,
    index:
      number,
  ) => {
    setForm(
      (
        current,
      ) => ({
        ...current,

        [type]:
          current[type]
            .map(
              (
                modifier,
              ) =>
                modifier.optionId ===
                optionId
                  ? {
                      ...modifier,

                      items:
                        modifier.items.filter(
                          (
                            _item,
                            currentIndex,
                          ) =>
                            currentIndex !==
                            index,
                        ),
                    }
                  : modifier,
            )
            .filter(
              (modifier) =>
                modifier.items.length >
                0,
            ),
      }),
    );
  };

  /* ========================================
     GUARDAR
  ======================================== */

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (
        !token ||
        !selectedProduct
      ) {
        return;
      }

      const baseItems =
        form.baseItems.map(
          (item) => ({
            ingredient:
              item.ingredient,

            quantity:
              Number(
                item.quantity,
              ),

            removableIngredient:
              item.removableIngredient ||
              undefined,
          }),
        );

      const normalizeModifiers = (
        modifiers:
          OptionModifierForm[],
      ) =>
        modifiers
          .map(
            (modifier) => ({
              optionId:
                modifier.optionId,

              items:
                modifier.items.map(
                  (item) => ({
                    ingredient:
                      item.ingredient,

                    quantity:
                      Number(
                        item.quantity,
                      ),
                  }),
                ),
            }),
          )
          .filter(
            (modifier) =>
              modifier.items.length >
              0,
          );

      if (
        form.active &&
        baseItems.length ===
          0
      ) {
        setError(
          "Agregá al menos un insumo base.",
        );

        return;
      }

      const invalidBase =
        baseItems.some(
          (item) =>
            !item.ingredient ||
            !Number.isFinite(
              item.quantity,
            ) ||
            item.quantity <=
              0,
        );

      const sizeModifiers =
        normalizeModifiers(
          form.sizeModifiers,
        );

      const invalidSize =
        sizeModifiers.some(
          (modifier) =>
            modifier.items.some(
              (item) =>
                !item.ingredient ||
                !Number.isFinite(
                  item.quantity,
                ) ||
                item.quantity ===
                  0,
            ),
        );

      const extraModifiers =
        normalizeModifiers(
          form.extraModifiers,
        );

      const invalidExtra =
        extraModifiers.some(
          (modifier) =>
            modifier.items.some(
              (item) =>
                !item.ingredient ||
                !Number.isFinite(
                  item.quantity,
                ) ||
                item.quantity <=
                  0,
            ),
        );

      if (
        invalidBase ||
        invalidSize ||
        invalidExtra
      ) {
        setError(
          "Revisá los insumos y cantidades de la receta.",
        );

        return;
      }

      setSaving(
        true,
      );

      setError(
        null,
      );

      setSuccess(
        false,
      );

      setTrackingMessage(
        null,
      );

      try {
        const saved =
          await saveAdminRecipe(
            selectedProduct._id,
            token,
            {
              active:
                form.active,

              baseItems,

              sizeModifiers,

              extraModifiers,
            },
          );

        setRecipes(
          (
            currentRecipes,
          ) => {
            const exists =
              currentRecipes.some(
                (recipe) =>
                  getRecipeProductId(
                    recipe.product,
                  ) ===
                  selectedProduct._id,
              );

            if (!exists) {
              return [
                ...currentRecipes,
                saved,
              ];
            }

            return currentRecipes.map(
              (recipe) =>
                getRecipeProductId(
                  recipe.product,
                ) ===
                selectedProduct._id
                  ? saved
                  : recipe,
            );
          },
        );

        setForm(
          recipeToForm(
            saved,
          ),
        );

        setSuccess(
          true,
        );
      } catch (saveError) {
        setError(
          saveError instanceof Error
            ? saveError.message
            : "No se pudo guardar la receta.",
        );
      } finally {
        setSaving(
          false,
        );
      }
    };

  /* ========================================
     RENDER MODIFICADOR
  ======================================== */

  const renderModifierSection = (
    title:
      string,
    description:
      string,
    options:
      AdminProductOption[],
    type:
      | "sizeModifiers"
      | "extraModifiers",
  ) => (
    <section className="admin-recipes__recipe-section">
      <header>
        <div>
          <h3>
            {title}
          </h3>

          <p>
            {description}
          </p>
        </div>
      </header>

      {options.length ===
      0 ? (
        <div className="admin-recipes__empty-small">
          Este producto no tiene opciones de este tipo.
        </div>
      ) : (
        <div className="admin-recipes__option-list">
          {options.map(
            (
              option,
            ) => {
              const modifier =
                getOptionModifier(
                  form[type],
                  option.id,
                );

              const rows =
                modifier?.items ??
                [];

              return (
                <article
                  key={
                    option.id
                  }
                  className="admin-recipes__option"
                >
                  <div className="admin-recipes__option-heading">
                    <div>
                      <strong>
                        {
                          getOptionLabel(
                            option,
                          )
                        }
                      </strong>

                      <span>
                        ID:{" "}
                        {
                          option.id
                        }
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        addModifierRow(
                          type,
                          option.id,
                        )
                      }
                    >
                      + Agregar ajuste
                    </button>
                  </div>

                  {rows.length ===
                  0 ? (
                    <p className="admin-recipes__option-empty">
                      Sin cambios de stock para esta opción.
                    </p>
                  ) : (
                    <div className="admin-recipes__rows">
                      {rows.map(
                        (
                          row,
                          index,
                        ) => (
                          <div
                            className="admin-recipes__modifier-row"
                            key={`${option.id}-${index}`}
                          >
                            <label>
                              <span>
                                Insumo
                              </span>

                              <select
                                value={
                                  row.ingredient
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateModifierRow(
                                    type,
                                    option.id,
                                    index,
                                    {
                                      ingredient:
                                        event.target.value,
                                    },
                                  )
                                }
                                required
                              >
                                <option value="">
                                  Elegir...
                                </option>

                                {activeIngredients.map(
                                  (
                                    ingredient,
                                  ) => (
                                    <option
                                      key={
                                        ingredient._id
                                      }
                                      value={
                                        ingredient._id
                                      }
                                    >
                                      {
                                        ingredient.name
                                      }
                                    </option>
                                  ),
                                )}
                              </select>
                            </label>

                            <label>
                              <span>
                                {type ===
                                "sizeModifiers"
                                  ? "Ajuste (+ / -)"
                                  : "Cantidad extra"}
                              </span>

                              <input
                                type="number"
                                step="0.01"
                                value={
                                  row.quantity
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateModifierRow(
                                    type,
                                    option.id,
                                    index,
                                    {
                                      quantity:
                                        event.target.value,
                                    },
                                  )
                                }
                                required
                              />
                            </label>

                            <button
                              type="button"
                              className="admin-recipes__remove-row"
                              onClick={() =>
                                removeModifierRow(
                                  type,
                                  option.id,
                                  index,
                                )
                              }
                            >
                              Quitar
                            </button>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </article>
              );
            },
          )}
        </div>
      )}
    </section>
  );

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
            className="admin-dashboard__nav-link"
          >
            Inventario
          </Link>

          <Link
            to="/admin/recetas"
            className="admin-dashboard__nav-link admin-dashboard__nav-link--active"
            aria-current="page"
          >
            Recetas
          </Link>
        </nav>

        <section className="admin-recipes">
          <header className="admin-recipes__header">
            <div>
              <span className="admin-recipes__eyebrow">
                Consumo de insumos
              </span>

              <h2>
                Recetas
              </h2>

              <p>
                Definí qué insumos consume cada producto, tamaño y extra.
              </p>
            </div>

            <div className="admin-recipes__counter">
              <strong>
                {
                  configuredCount
                }
              </strong>

              <span>
                de{" "}
                {
                  products.length
                }{" "}
                configuradas
              </span>
            </div>
          </header>

          {inventorySettings && (
            <section
              className={[
                "admin-recipes__tracking",
                inventorySettings.enabled
                  ? "admin-recipes__tracking--enabled"
                  : "admin-recipes__tracking--setup",
              ].join(" ")}
            >
              <div>
                <span className="admin-recipes__tracking-status">
                  {inventorySettings.enabled
                    ? "Activo"
                    : "En preparación"}
                </span>

                <h3>
                  Descuento automático de stock
                </h3>

                <p>
                  {inventorySettings.enabled
                    ? "Al confirmar un pedido se descuentan los insumos según las recetas guardadas."
                    : "El dueño puede cargar y revisar los datos sin afectar los pedidos. Hasta activarlo, confirmar un pedido no modifica el stock."}
                </p>

                <small>
                  {activeIngredients.length} insumos activos · {configuredCount} recetas configuradas
                </small>
              </div>

              <button
                type="button"
                onClick={() =>
                  void handleTrackingToggle()
                }
                disabled={
                  updatingTracking ||
                  (
                    !inventorySettings.enabled &&
                    !canEnableTracking
                  )
                }
              >
                {updatingTracking
                  ? "Actualizando..."
                  : inventorySettings.enabled
                    ? "Pausar descuento"
                    : "Activar descuento"}
              </button>
            </section>
          )}

          {error && (
            <div
              className="admin-recipes__error"
              role="alert"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="admin-recipes__success"
              role="status"
            >
              Receta guardada correctamente.
            </div>
          )}

          {trackingMessage && (
            <div
              className="admin-recipes__success"
              role="status"
            >
              {trackingMessage}
            </div>
          )}

          {loading ? (
            <div className="admin-recipes__loading">
              Cargando recetas...
            </div>
          ) : products.length ===
            0 ? (
            <div className="admin-recipes__loading">
              No hay productos para configurar.
            </div>
          ) : activeIngredients.length ===
            0 ? (
            <div className="admin-recipes__warning">
              Antes de crear recetas necesitás cargar insumos activos en Inventario.
            </div>
          ) : (
            <form
              className="admin-recipes__form"
              onSubmit={
                handleSubmit
              }
            >
              <section className="admin-recipes__selector">
                <label>
                  <span>
                    Producto
                  </span>

                  <select
                    value={
                      selectedProductId
                    }
                    onChange={(
                      event,
                    ) =>
                      handleSelectProduct(
                        event.target.value,
                      )
                    }
                  >
                    {products.map(
                      (
                        product,
                      ) => {
                        const recipe =
                          getProductRecipe(
                            recipes,
                            product._id,
                          );

                        const configured =
                          Boolean(
                            recipe &&
                            recipe.active &&
                            recipe.baseItems
                              .length >
                              0,
                          );

                        return (
                          <option
                            key={
                              product._id
                            }
                            value={
                              product._id
                            }
                          >
                            {configured
                              ? "✓ "
                              : "○ "}
                            {
                              product.name
                            }
                          </option>
                        );
                      },
                    )}
                  </select>
                </label>

                {selectedProduct && (
                  <div className="admin-recipes__selected-product">
                    <strong>
                      {
                        selectedProduct.name
                      }
                    </strong>

                    <span>
                      ID público:{" "}
                      {
                        selectedProduct.legacyId ??
                        "—"
                      }
                    </span>
                  </div>
                )}
              </section>

              {selectedProduct && (
                <>
                  <label className="admin-recipes__active">
                    <input
                      type="checkbox"
                      checked={
                        form.active
                      }
                      onChange={(
                        event,
                      ) =>
                        setForm(
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
                      Receta activa
                    </span>
                  </label>

                  <section className="admin-recipes__recipe-section">
                    <header>
                      <div>
                        <h3>
                          Receta base
                        </h3>

                        <p>
                          Cantidad consumida por una unidad del producto con su configuración base.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={
                          addBaseRow
                        }
                      >
                        + Agregar insumo
                      </button>
                    </header>

                    {form.baseItems.length ===
                    0 ? (
                      <div className="admin-recipes__empty-small">
                        Todavía no agregaste insumos a la receta base.
                      </div>
                    ) : (
                      <div className="admin-recipes__rows">
                        {form.baseItems.map(
                          (
                            row,
                            index,
                          ) => (
                            <div
                              className="admin-recipes__base-row"
                              key={`base-${index}`}
                            >
                              <label>
                                <span>
                                  Insumo
                                </span>

                                <select
                                  value={
                                    row.ingredient
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateBaseRow(
                                      index,
                                      {
                                        ingredient:
                                          event.target.value,
                                      },
                                    )
                                  }
                                  required
                                >
                                  <option value="">
                                    Elegir...
                                  </option>

                                  {activeIngredients.map(
                                    (
                                      ingredient,
                                    ) => (
                                      <option
                                        key={
                                          ingredient._id
                                        }
                                        value={
                                          ingredient._id
                                        }
                                      >
                                        {
                                          ingredient.name
                                        }
                                      </option>
                                    ),
                                  )}
                                </select>
                              </label>

                              <label>
                                <span>
                                  Cantidad
                                </span>

                                <input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={
                                    row.quantity
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateBaseRow(
                                      index,
                                      {
                                        quantity:
                                          event.target.value,
                                      },
                                    )
                                  }
                                  required
                                />
                              </label>

                              <label>
                                <span>
                                  Si el cliente pide sin...
                                </span>

                                <select
                                  value={
                                    row.removableIngredient
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateBaseRow(
                                      index,
                                      {
                                        removableIngredient:
                                          event.target.value,
                                      },
                                    )
                                  }
                                >
                                  <option value="">
                                    No removible
                                  </option>

                                  {selectedProduct.ingredients.map(
                                    (
                                      ingredientName,
                                    ) => (
                                      <option
                                        key={
                                          ingredientName
                                        }
                                        value={
                                          ingredientName
                                        }
                                      >
                                        {
                                          ingredientName
                                        }
                                      </option>
                                    ),
                                  )}
                                </select>
                              </label>

                              <button
                                type="button"
                                className="admin-recipes__remove-row"
                                onClick={() =>
                                  removeBaseRow(
                                    index,
                                  )
                                }
                              >
                                Quitar
                              </button>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </section>

                  {renderModifierSection(
                    "Tamaños",
                    "Indicá únicamente la diferencia respecto de la receta base. Podés usar valores negativos.",
                    selectedProduct.sizes,
                    "sizeModifiers",
                  )}

                  {renderModifierSection(
                    "Extras",
                    "Indicá qué cantidad adicional consume cada extra elegido por el cliente.",
                    selectedProduct.extras,
                    "extraModifiers",
                  )}

                  <div className="admin-recipes__save">
                    <button
                      type="submit"
                      disabled={
                        saving
                      }
                    >
                      {saving
                        ? "Guardando..."
                        : "Guardar receta"}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
