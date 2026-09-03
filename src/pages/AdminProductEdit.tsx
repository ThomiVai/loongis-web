import {
  useEffect,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  Link,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  createAdminProduct,
  getAdminProductById,
  updateAdminProduct,
} from "../services/adminProductsApi";

import type {
  AdminProduct,
  AdminProductOption,
  DailyComboBurgerId,
} from "../services/adminProductsApi";

import {
  getAdminCategories,
} from "../services/adminCategoriesApi";

import type {
  AdminCategory,
} from "../services/adminCategoriesApi";

import {
  getAdminToken,
  removeAdminToken,
} from "../utils/adminSession";

import "../styles/AdminProductEdit.css";

/* ========================================
   CREAR ID PARA OPCIONES
======================================== */

function createOptionId(): string {
  return `option-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

const dailyComboPresentations:
  Record<
    DailyComboBurgerId,
    {
      image: string;
      imageAlt: string;
    }
  > = {
  "solo-queso": {
    image:
      "/images/burgers/combo-simplequeso.png",
    imageAlt:
      "Combo del Día con hamburguesa Solo Queso, papas y bebida",
  },
  clasic: {
    image:
      "/images/burgers/combo-promo.png",
    imageAlt:
      "Combo del Día con Loongis Clasic, papas y bebida",
  },
  bacon: {
    image:
      "/images/burgers/combo-bacon.png",
    imageAlt:
      "Combo del Día con Loongis Bacon, papas y bebida",
  },
  crispy: {
    image:
      "/images/burgers/combo-crispy.png",
    imageAlt:
      "Combo del Día con Loongis Crispy, papas y bebida",
  },
};

/* ========================================
   COMPONENTE
======================================== */

export function AdminProductEdit() {
  const navigate =
    useNavigate();

  const {
    productId,
  } =
    useParams();

  const token =
    getAdminToken();

  const isCreating =
    productId === "nuevo";

  /* ========================================
     PRODUCTO
  ======================================== */

  const [
    product,
    setProduct,
  ] =
    useState<AdminProduct | null>(
      null,
    );

  /* ========================================
     INFORMACIÓN
  ======================================== */

  const [
    legacyId,
    setLegacyId,
  ] =
    useState("");

  const [
    name,
    setName,
  ] =
    useState("");

  const [
    description,
    setDescription,
  ] =
    useState("");

  const [
    price,
    setPrice,
  ] =
    useState("");

  const [
    image,
    setImage,
  ] =
    useState("");

  const [
    imageAlt,
    setImageAlt,
  ] =
    useState("");

  const [
    order,
    setOrder,
  ] =
    useState("0");

  /* ========================================
     CATEGORÍAS
  ======================================== */

  const [
    categories,
    setCategories,
  ] =
    useState<AdminCategory[]>(
      [],
    );

  const [
    categoryId,
    setCategoryId,
  ] =
    useState("");

  /* ========================================
     VISIBILIDAD
  ======================================== */

  const [
    active,
    setActive,
  ] =
    useState(true);

  const [
    featured,
    setFeatured,
  ] =
    useState(false);

  const [
    dailyPromo,
    setDailyPromo,
  ] =
    useState(false);

  const [
    dailyComboBurgerId,
    setDailyComboBurgerId,
  ] =
    useState<DailyComboBurgerId>(
      "clasic",
    );

  /* ========================================
     PERSONALIZACIÓN
  ======================================== */

  const [
    ingredients,
    setIngredients,
  ] =
    useState<string[]>([]);

  const [
    sizes,
    setSizes,
  ] =
    useState<
      AdminProductOption[]
    >([]);

  const [
    extras,
    setExtras,
  ] =
    useState<
      AdminProductOption[]
    >([]);

  /* ========================================
     INTERFAZ
  ======================================== */

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
    loadError,
    setLoadError,
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
    loadedProductId,
    setLoadedProductId,
  ] =
    useState<string | null>(
      null,
    );

  const loading =
    Boolean(
      token &&
        productId &&
        loadedProductId !==
          productId,
    );

  /* ========================================
     CARGAR EDITOR
  ======================================== */

  useEffect(() => {
    if (
      !token ||
      !productId
    ) {
      return;
    }

    const currentProductId =
      productId;

    const creating =
      currentProductId ===
      "nuevo";

    let mounted =
      true;

    async function loadEditor() {
      try {
        /*
          NUEVO PRODUCTO:
          solamente necesitamos
          cargar categorías.
        */

        if (creating) {
          const categoriesData =
            await getAdminCategories();

          if (!mounted) {
            return;
          }

          setCategories(
            categoriesData,
          );

          setProduct(null);

          setLegacyId("");
          setName("");
          setDescription("");
          setPrice("");
          setImage("");
          setImageAlt("");
          setOrder("0");

          setCategoryId("");

          setActive(true);
          setFeatured(false);
          setDailyPromo(false);
          setDailyComboBurgerId(
            "clasic",
          );

          setIngredients([]);
          setSizes([]);
          setExtras([]);

          setLoadError(null);

          return;
        }

        /*
          EDITAR:
          cargamos producto
          y categorías juntos.
        */

        const [
          productData,
          categoriesData,
        ] =
          await Promise.all([
            getAdminProductById(
              currentProductId,
            ),

            getAdminCategories(),
          ]);

        if (!mounted) {
          return;
        }

        setProduct(
          productData,
        );

        setCategories(
          categoriesData,
        );

        setLegacyId(
          productData.legacyId
            ? String(
                productData.legacyId,
              )
            : "",
        );

        setName(
          productData.name,
        );

        setDescription(
          productData.description,
        );

        setPrice(
          String(
            productData.price,
          ),
        );

        setImage(
          productData.image,
        );

        setImageAlt(
          productData.imageAlt,
        );

        setOrder(
          String(
            productData.order,
          ),
        );

        setCategoryId(
          productData.category
            ? productData
                .category._id
            : "",
        );

        setActive(
          productData.active,
        );

        setFeatured(
          productData.featured,
        );

        setDailyPromo(
          productData.dailyPromo,
        );

        setDailyComboBurgerId(
          productData.dailyComboBurgerId ??
            "clasic",
        );

        setIngredients([
          ...productData.ingredients,
        ]);

        setSizes(
          productData.sizes.map(
            (size) => ({
              ...size,
            }),
          ),
        );

        setExtras(
          productData.extras.map(
            (extra) => ({
              ...extra,
            }),
          ),
        );

        setLoadError(null);
      } catch (loadError) {
        if (!mounted) {
          return;
        }

        setLoadError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el editor.",
        );
      } finally {
        if (mounted) {
          setLoadedProductId(
            currentProductId,
          );
        }
      }
    }

    void loadEditor();

    return () => {
      mounted = false;
    };
  }, [
    productId,
    token,
  ]);

  /* ========================================
     CATEGORÍA SELECCIONADA
  ======================================== */

  const isDailyCombo =
    !isCreating &&
    Number(legacyId) === 109;

  const handleCategoryChange = (
    newCategoryId: string,
  ) => {
    setCategoryId(
      newCategoryId,
    );

    const newCategory =
      categories.find(
        (category) =>
          category._id ===
          newCategoryId,
      );

    if (
      newCategory?.slug !==
      "combos"
    ) {
      setDailyPromo(false);
    }
  };

  /* ========================================
     INGREDIENTES
  ======================================== */

  const handleIngredientChange = (
    index: number,
    value: string,
  ) => {
    setIngredients(
      (currentIngredients) =>
        currentIngredients.map(
          (
            ingredient,
            ingredientIndex,
          ) =>
            ingredientIndex ===
            index
              ? value
              : ingredient,
        ),
    );
  };

  const addIngredient = () => {
    setIngredients(
      (currentIngredients) => [
        ...currentIngredients,
        "",
      ],
    );
  };

  const removeIngredient = (
    index: number,
  ) => {
    setIngredients(
      (currentIngredients) =>
        currentIngredients.filter(
          (
            _ingredient,
            ingredientIndex,
          ) =>
            ingredientIndex !==
            index,
        ),
    );
  };

  /* ========================================
     TAMAÑOS
  ======================================== */

  const handleSizeNameChange = (
    index: number,
    value: string,
  ) => {
    setSizes(
      (currentSizes) =>
        currentSizes.map(
          (
            size,
            sizeIndex,
          ) =>
            sizeIndex === index
              ? {
                  ...size,
                  name: value,
                  label: value,
                }
              : size,
        ),
    );
  };

  const handleSizePriceChange = (
    index: number,
    value: string,
  ) => {
    const numericValue =
      Number(value);

    setSizes(
      (currentSizes) =>
        currentSizes.map(
          (
            size,
            sizeIndex,
          ) =>
            sizeIndex === index
              ? {
                  ...size,

                  priceModifier:
                    Number.isFinite(
                      numericValue,
                    )
                      ? numericValue
                      : 0,
                }
              : size,
        ),
    );
  };

  const addSize = () => {
    setSizes(
      (currentSizes) => [
        ...currentSizes,

        {
          id:
            createOptionId(),

          name: "",
          label: "",

          priceModifier: 0,
        },
      ],
    );
  };

  const removeSize = (
    index: number,
  ) => {
    setSizes(
      (currentSizes) =>
        currentSizes.filter(
          (
            _size,
            sizeIndex,
          ) =>
            sizeIndex !==
            index,
        ),
    );
  };

  /* ========================================
     EXTRAS
  ======================================== */

  const handleExtraNameChange = (
    index: number,
    value: string,
  ) => {
    setExtras(
      (currentExtras) =>
        currentExtras.map(
          (
            extra,
            extraIndex,
          ) =>
            extraIndex === index
              ? {
                  ...extra,
                  name: value,
                  label: value,
                }
              : extra,
        ),
    );
  };

  const handleExtraPriceChange = (
    index: number,
    value: string,
  ) => {
    const numericValue =
      Number(value);

    setExtras(
      (currentExtras) =>
        currentExtras.map(
          (
            extra,
            extraIndex,
          ) =>
            extraIndex === index
              ? {
                  ...extra,

                  priceModifier:
                    Number.isFinite(
                      numericValue,
                    )
                      ? numericValue
                      : 0,
                }
              : extra,
        ),
    );
  };

  const addExtra = () => {
    setExtras(
      (currentExtras) => [
        ...currentExtras,

        {
          id:
            createOptionId(),

          name: "",
          label: "",

          priceModifier: 0,
        },
      ],
    );
  };

  const removeExtra = (
    index: number,
  ) => {
    setExtras(
      (currentExtras) =>
        currentExtras.filter(
          (
            _extra,
            extraIndex,
          ) =>
            extraIndex !== index,
        ),
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
        !productId
      ) {
        return;
      }

      const numericPrice =
        Number(price);

      const numericOrder =
        Number(order);

      const numericLegacyId =
        Number(legacyId);

      /* =====================================
         VALIDACIONES
      ===================================== */

      if (
        !name.trim() ||
        !description.trim()
      ) {
        setError(
          "Nombre y descripción son obligatorios.",
        );

        return;
      }

      if (
        !Number.isFinite(
          numericPrice,
        ) ||
        numericPrice < 0
      ) {
        setError(
          "El precio ingresado no es válido.",
        );

        return;
      }

      if (
        !image.trim() ||
        !imageAlt.trim()
      ) {
        setError(
          "La imagen y su texto alternativo son obligatorios.",
        );

        return;
      }

      if (!categoryId) {
        setError(
          "Tenés que seleccionar una categoría.",
        );

        return;
      }

      if (
        !Number.isInteger(
          numericOrder,
        ) ||
        numericOrder < 0
      ) {
        setError(
          "El orden debe ser un número entero igual o mayor a 0.",
        );

        return;
      }

      if (
        isCreating &&
        (
          !Number.isInteger(
            numericLegacyId,
          ) ||
          numericLegacyId <= 0
        )
      ) {
        setError(
          "El ID público debe ser un número entero mayor a 0.",
        );

        return;
      }

      /* =====================================
         NORMALIZAR
      ===================================== */

      const normalizedIngredients =
        ingredients
          .map(
            (ingredient) =>
              ingredient.trim(),
          )
          .filter(Boolean);

      const normalizedSizes =
        sizes
          .map(
            (size) => ({
              ...size,

              name:
                size.name.trim(),

              label:
                size.name.trim(),
            }),
          )
          .filter(
            (size) =>
              size.name.length >
              0,
          );

      const normalizedExtras =
        extras
          .map(
            (extra) => ({
              ...extra,

              name:
                extra.name.trim(),

              label:
                extra.name.trim(),
            }),
          )
          .filter(
            (extra) =>
              extra.name.length >
              0,
          );

      setSaving(true);
      setError(null);
      setSuccess(false);

      try {
        /* =================================
           CREAR
        ================================= */

        if (isCreating) {
          const createdProduct =
            await createAdminProduct(
              token,
              {
                legacyId:
                  numericLegacyId,

                name:
                  name.trim(),

                description:
                  description.trim(),

                price:
                  numericPrice,

                image:
                  image.trim(),

                imageAlt:
                  imageAlt.trim(),

                category:
                  categoryId,

                order:
                  numericOrder,

                active,

                featured,

                dailyPromo:
                  false,

                ingredients:
                  normalizedIngredients,

                sizes:
                  normalizedSizes,

                extras:
                  normalizedExtras,
              },
            );

          navigate(
            `/admin/productos/${createdProduct._id}/editar`,
            {
              replace: true,
            },
          );

          return;
        }

        /* =================================
           EDITAR
        ================================= */

        const updatedProduct =
          await updateAdminProduct(
            productId,
            token,
            {
              name:
                name.trim(),

              description:
                description.trim(),

              price:
                numericPrice,

              image:
                image.trim(),

              imageAlt:
                imageAlt.trim(),

              category:
                categoryId,

              order:
                numericOrder,

              active,

              featured,

              dailyPromo:
                isDailyCombo,

              dailyComboBurgerId:
                isDailyCombo
                  ? dailyComboBurgerId
                  : undefined,

              ingredients:
                normalizedIngredients,

              sizes:
                normalizedSizes,

              extras:
                normalizedExtras,
            },
          );

        setProduct(
          updatedProduct,
        );

        setName(
          updatedProduct.name,
        );

        setDescription(
          updatedProduct.description,
        );

        setPrice(
          String(
            updatedProduct.price,
          ),
        );

        setImage(
          updatedProduct.image,
        );

        setImageAlt(
          updatedProduct.imageAlt,
        );

        setOrder(
          String(
            updatedProduct.order,
          ),
        );

        setCategoryId(
          updatedProduct.category
            ? updatedProduct
                .category._id
            : categoryId,
        );

        setActive(
          updatedProduct.active,
        );

        setFeatured(
          updatedProduct.featured,
        );

        setDailyPromo(
          updatedProduct.dailyPromo,
        );

        setDailyComboBurgerId(
          updatedProduct.dailyComboBurgerId ??
            "clasic",
        );

        setIngredients([
          ...updatedProduct.ingredients,
        ]);

        setSizes(
          updatedProduct.sizes.map(
            (size) => ({
              ...size,
            }),
          ),
        );

        setExtras(
          updatedProduct.extras.map(
            (extra) => ({
              ...extra,
            }),
          ),
        );

        setSuccess(true);
      } catch (submitError) {
        const message =
          submitError instanceof Error
            ? submitError.message
            : isCreating
              ? "No se pudo crear el producto."
              : "No se pudo actualizar el producto.";

        const normalizedMessage =
          message.toLowerCase();

        if (
          normalizedMessage.includes(
            "sesión",
          ) ||
          normalizedMessage.includes(
            "autentic",
          ) ||
          normalizedMessage.includes(
            "token",
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
        setSaving(false);
      }
    };

  /* ========================================
     SIN SESIÓN
  ======================================== */

  if (!token) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  /* ========================================
     SIN ID
  ======================================== */

  if (!productId) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  /* ========================================
     CARGANDO
  ======================================== */

  if (loading) {
    return (
      <main className="admin-product-edit">
        <div className="admin-product-edit__loading">
          Cargando editor...
        </div>
      </main>
    );
  }

  /* ========================================
     ERROR DE CARGA
  ======================================== */

  if (loadError) {
    return (
      <main className="admin-product-edit">
        <div className="admin-product-edit__container">
          <div className="admin-product-edit__load-error">
            <h1>
              No pudimos cargar
              el editor
            </h1>

            <p>
              {loadError}
            </p>

            <Link
              to="/admin"
              className="admin-product-edit__back-button"
            >
              Volver al panel
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (
    !isCreating &&
    !product
  ) {
    return null;
  }

  /* ========================================
     FORMULARIO
  ======================================== */

  return (
    <main className="admin-product-edit">
      <div className="admin-product-edit__container">

        <Link
          to="/admin"
          className="admin-product-edit__back"
        >
          ← Volver al panel
        </Link>

        {/* =================================
            HEADER
        ================================= */}

        <header className="admin-product-edit__header">
          <div>
            <span className="admin-product-edit__eyebrow">
              {isCreating
                ? "Nuevo producto"
                : "Editar producto"}
            </span>

            <h1>
              {isCreating
                ? name ||
                  "Crear producto"
                : name ||
                  product?.name}
            </h1>

            <p>
              {isCreating
                ? "Creá un nuevo producto para el catálogo de Loongis."
                : "Los cambios se guardan directamente en el catálogo de Loongis."}
            </p>
          </div>

          {image && (
            <div className="admin-product-edit__preview">
              <img
                src={image}
                alt={
                  imageAlt ||
                  "Vista previa del producto"
                }
              />
            </div>
          )}
        </header>

        <form
          className="admin-product-edit__form"
          onSubmit={
            handleSubmit
          }
        >

          {/* =================================
              INFORMACIÓN
          ================================= */}

          <section className="admin-product-edit__section">
            <h2>
              Información
            </h2>

            <div className="admin-product-edit__fields">

              <label className="admin-product-edit__field">
                <span>
                  ID público
                </span>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={legacyId}
                  onChange={(
                    event,
                  ) =>
                    setLegacyId(
                      event.target.value,
                    )
                  }
                  disabled={
                    saving ||
                    !isCreating
                  }
                  required={
                    isCreating
                  }
                />

                <small>
                  Es el número que usa
                  actualmente la web
                  para identificar el
                  producto. Debe ser
                  único.
                </small>
              </label>

              <label className="admin-product-edit__field">
                <span>
                  Nombre
                </span>

                <input
                  type="text"
                  value={name}
                  onChange={(
                    event,
                  ) =>
                    setName(
                      event.target.value,
                    )
                  }
                  disabled={saving}
                  required
                />
              </label>

              <label className="admin-product-edit__field">
                <span>
                  Descripción
                </span>

                <textarea
                  value={description}
                  onChange={(
                    event,
                  ) =>
                    setDescription(
                      event.target.value,
                    )
                  }
                  disabled={saving}
                  rows={5}
                  required
                />
              </label>

              <div className="admin-product-edit__two-columns">
                <label className="admin-product-edit__field">
                  <span>
                    Precio
                  </span>

                  <div className="admin-product-edit__price-field">
                    <span>
                      $
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={price}
                      onChange={(
                        event,
                      ) =>
                        setPrice(
                          event.target.value,
                        )
                      }
                      disabled={
                        saving
                      }
                      required
                    />
                  </div>
                </label>

                <label className="admin-product-edit__field">
                  <span>
                    Orden
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={order}
                    onChange={(
                      event,
                    ) =>
                      setOrder(
                        event.target.value,
                      )
                    }
                    disabled={saving}
                    required
                  />
                </label>
              </div>

              <label className="admin-product-edit__field">
                <span>
                  Categoría
                </span>

                <select
                  value={categoryId}
                  onChange={(
                    event,
                  ) =>
                    handleCategoryChange(
                      event.target.value,
                    )
                  }
                  disabled={saving}
                  required
                >
                  <option value="">
                    Seleccionar categoría
                  </option>

                  {categories.map(
                    (
                      category,
                    ) => (
                      <option
                        key={
                          category._id
                        }
                        value={
                          category._id
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>
          </section>

          {/* =================================
              IMAGEN
          ================================= */}

          <section className="admin-product-edit__section">
            <h2>
              Imagen
            </h2>

            <div className="admin-product-edit__fields">
              <label className="admin-product-edit__field">
                <span>
                  Ruta de imagen
                </span>

                <input
                  type="text"
                  value={image}
                  onChange={(
                    event,
                  ) =>
                    setImage(
                      event.target.value,
                    )
                  }
                  disabled={saving}
                  placeholder="/images/burgers/producto.png"
                  required
                />
              </label>

              <label className="admin-product-edit__field">
                <span>
                  Texto alternativo
                </span>

                <input
                  type="text"
                  value={imageAlt}
                  onChange={(
                    event,
                  ) =>
                    setImageAlt(
                      event.target.value,
                    )
                  }
                  disabled={saving}
                  placeholder="Descripción visual del producto"
                  required
                />
              </label>
            </div>
          </section>

          {/* =================================
              VISIBILIDAD
          ================================= */}

          <section className="admin-product-edit__section">
            <h2>
              Visibilidad
            </h2>

            <div className="admin-product-edit__toggles">
              <label className="admin-product-edit__toggle">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(
                    event,
                  ) =>
                    setActive(
                      event.target.checked,
                    )
                  }
                  disabled={saving}
                />

                <div>
                  <strong>
                    Producto activo
                  </strong>

                  <span>
                    Los clientes pueden
                    verlo y comprarlo.
                  </span>
                </div>
              </label>

              <label className="admin-product-edit__toggle">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(
                    event,
                  ) =>
                    setFeatured(
                      event.target.checked,
                    )
                  }
                  disabled={saving}
                />

                <div>
                  <strong>
                    Producto destacado
                  </strong>

                  <span>
                    Puede aparecer entre
                    los principales del
                    Home.
                  </span>
                </div>
              </label>

              {isDailyCombo && (
                <label className="admin-product-edit__toggle">
                  <input
                    type="checkbox"
                    checked={
                      dailyPromo
                    }
                    readOnly
                    disabled
                  />

                  <div>
                    <strong>
                      Combo del día
                    </strong>

                    <span>
                      Es la promo principal
                      del Home y permanece
                      activa automáticamente.
                    </span>
                  </div>
                </label>
              )}
            </div>
          </section>

          {isDailyCombo && (
            <section className="admin-product-edit__section admin-product-edit__daily-combo">
              <div className="admin-product-edit__section-header">
                <div>
                  <h2>
                    Configuración del Combo del Día
                  </h2>

                  <p>
                    Elegí qué hamburguesa doble se ofrecerá. El cliente podrá quitar ingredientes y seleccionar su bebida.
                  </p>
                </div>
              </div>

              <label className="admin-product-edit__field">
                <span>
                  Hamburguesa disponible hoy
                </span>

                <select
                  value={dailyComboBurgerId}
                  onChange={(event) => {
                    const burgerId =
                      event.target.value as DailyComboBurgerId;

                    const presentation =
                      dailyComboPresentations[
                        burgerId
                      ];

                    setDailyComboBurgerId(
                      burgerId,
                    );
                    setImage(
                      presentation.image,
                    );
                    setImageAlt(
                      presentation.imageAlt,
                    );
                  }}
                  disabled={saving}
                >
                  <option value="solo-queso">
                    Solo Queso
                  </option>
                  <option value="clasic">
                    Loongis Clasic
                  </option>
                  <option value="bacon">
                    Loongis Bacon
                  </option>
                  <option value="crispy">
                    Loongis Crispy
                  </option>
                </select>

                <small>
                  Incluye una porción de papas y bebida a elección: Coca-Cola, Pepsi, Sprite o agua.
                </small>
              </label>
            </section>
          )}

          {!isDailyCombo && (
            <>
              {/* =============================
                  INGREDIENTES
              ============================= */}

          <section className="admin-product-edit__section">
            <div className="admin-product-edit__section-header">
              <div>
                <h2>
                  Ingredientes
                </h2>

                <p>
                  Ingredientes que
                  forman parte del
                  producto.
                </p>
              </div>

              <button
                type="button"
                className="admin-product-edit__add"
                onClick={
                  addIngredient
                }
                disabled={saving}
              >
                + Agregar
              </button>
            </div>

            <div className="admin-product-edit__items">
              {ingredients.map(
                (
                  ingredient,
                  index,
                ) => (
                  <div
                    key={`ingredient-${index}`}
                    className="admin-product-edit__ingredient"
                  >
                    <input
                      type="text"
                      value={
                        ingredient
                      }
                      onChange={(
                        event,
                      ) =>
                        handleIngredientChange(
                          index,
                          event.target.value,
                        )
                      }
                      disabled={saving}
                    />

                    <button
                      type="button"
                      className="admin-product-edit__remove"
                      onClick={() =>
                        removeIngredient(
                          index,
                        )
                      }
                      disabled={saving}
                    >
                      ×
                    </button>
                  </div>
                ),
              )}
            </div>
          </section>

          {/* =================================
              TAMAÑOS
          ================================= */}

          <section className="admin-product-edit__section">
            <div className="admin-product-edit__section-header">
              <div>
                <h2>
                  Tamaños
                </h2>

                <p>
                  Variantes del producto
                  y modificación del
                  precio.
                </p>
              </div>

              <button
                type="button"
                className="admin-product-edit__add"
                onClick={addSize}
                disabled={saving}
              >
                + Agregar
              </button>
            </div>

            <div className="admin-product-edit__items">
              {sizes.map(
                (
                  size,
                  index,
                ) => (
                  <div
                    key={size.id}
                    className="admin-product-edit__option"
                  >
                    <label>
                      <span>
                        Nombre
                      </span>

                      <input
                        type="text"
                        value={
                          size.name
                        }
                        onChange={(
                          event,
                        ) =>
                          handleSizeNameChange(
                            index,
                            event.target.value,
                          )
                        }
                        disabled={saving}
                      />
                    </label>

                    <label>
                      <span>
                        Modificador
                      </span>

                      <input
                        type="number"
                        step="1"
                        value={
                          size.priceModifier
                        }
                        onChange={(
                          event,
                        ) =>
                          handleSizePriceChange(
                            index,
                            event.target.value,
                          )
                        }
                        disabled={saving}
                      />
                    </label>

                    <button
                      type="button"
                      className="admin-product-edit__remove"
                      onClick={() =>
                        removeSize(
                          index,
                        )
                      }
                      disabled={saving}
                    >
                      ×
                    </button>
                  </div>
                ),
              )}
            </div>
          </section>

          {/* =================================
              EXTRAS
          ================================= */}

          <section className="admin-product-edit__section">
            <div className="admin-product-edit__section-header">
              <div>
                <h2>
                  Extras
                </h2>

                <p>
                  Adicionales que el
                  cliente puede sumar.
                </p>
              </div>

              <button
                type="button"
                className="admin-product-edit__add"
                onClick={addExtra}
                disabled={saving}
              >
                + Agregar
              </button>
            </div>

            <div className="admin-product-edit__items">
              {extras.map(
                (
                  extra,
                  index,
                ) => (
                  <div
                    key={extra.id}
                    className="admin-product-edit__option"
                  >
                    <label>
                      <span>
                        Nombre
                      </span>

                      <input
                        type="text"
                        value={
                          extra.name
                        }
                        onChange={(
                          event,
                        ) =>
                          handleExtraNameChange(
                            index,
                            event.target.value,
                          )
                        }
                        disabled={saving}
                      />
                    </label>

                    <label>
                      <span>
                        Precio extra
                      </span>

                      <input
                        type="number"
                        step="1"
                        value={
                          extra.priceModifier
                        }
                        onChange={(
                          event,
                        ) =>
                          handleExtraPriceChange(
                            index,
                            event.target.value,
                          )
                        }
                        disabled={saving}
                      />
                    </label>

                    <button
                      type="button"
                      className="admin-product-edit__remove"
                      onClick={() =>
                        removeExtra(
                          index,
                        )
                      }
                      disabled={saving}
                    >
                      ×
                    </button>
                  </div>
                ),
              )}
            </div>
          </section>

            </>
          )}

          {/* =================================
              MENSAJES
          ================================= */}

          {error && (
            <div
              className="admin-product-edit__error"
              role="alert"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="admin-product-edit__success"
              role="status"
            >
              Cambios guardados
              correctamente.
            </div>
          )}

          {/* =================================
              ACCIONES
          ================================= */}

          <div className="admin-product-edit__actions">
            <Link
              to="/admin"
              className="admin-product-edit__cancel"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className="admin-product-edit__save"
              disabled={saving}
            >
              {saving
                ? isCreating
                  ? "Creando..."
                  : "Guardando..."
                : isCreating
                  ? "Crear producto"
                  : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
