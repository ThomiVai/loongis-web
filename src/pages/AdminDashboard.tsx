import {
  useEffect,
  useState,
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
  deleteAdminProduct,
  getAdminProducts,
} from "../services/adminProductsApi";

import type {
  AdminProduct,
} from "../services/adminProductsApi";

import {
  getAdminToken,
  removeAdminToken,
} from "../utils/adminSession";

import "../styles/AdminDashboard.css";

/* ========================================
   PRECIO
======================================== */

function formatPrice(
  price: number,
): string {
  return `$ ${price.toLocaleString(
    "es-AR",
  )}`;
}

/* ========================================
   DASHBOARD
======================================== */

export function AdminDashboard() {
  const navigate =
    useNavigate();

  /*
    El admin ya fue validado por
    ProtectedAdminRoute.

    No necesitamos volver a llamar
    GET /api/auth/me.
  */

  const {
    admin,
  } =
    useOutletContext<ProtectedAdminOutletContext>();

  const token =
    getAdminToken();

  /* ========================================
     PRODUCTOS
  ======================================== */

  const [
    products,
    setProducts,
  ] =
    useState<AdminProduct[]>(
      [],
    );

  const [
    productsLoading,
    setProductsLoading,
  ] =
    useState(true);

  const [
    productsError,
    setProductsError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    deletingProductId,
    setDeletingProductId,
  ] =
    useState<string | null>(
      null,
    );

  /* ========================================
     CARGAR PRODUCTOS
  ======================================== */

  useEffect(() => {
    let mounted =
      true;

    async function loadProducts() {
      try {
        const productsData =
          await getAdminProducts();

        if (!mounted) {
          return;
        }

        setProducts(
          productsData,
        );

        setProductsError(
          null,
        );
      } catch (error) {
        if (!mounted) {
          return;
        }

        setProductsError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los productos.",
        );
      } finally {
        if (mounted) {
          setProductsLoading(
            false,
          );
        }
      }
    }

    void loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  /* ========================================
     CERRAR SESIÓN
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
     ELIMINAR PRODUCTO
  ======================================== */

  const handleDeleteProduct =
    async (
      product:
        AdminProduct,
    ) => {
      if (!token) {
        removeAdminToken();

        navigate(
          "/admin/login",
          {
            replace: true,
          },
        );

        return;
      }

      const confirmed =
        window.confirm(
          `¿Seguro que querés eliminar "${product.name}"?\n\nEsta acción elimina el producto de la base de datos.`,
        );

      if (!confirmed) {
        return;
      }

      setDeletingProductId(
        product._id,
      );

      setProductsError(
        null,
      );

      try {
        await deleteAdminProduct(
          product._id,
          token,
        );

        setProducts(
          (
            currentProducts,
          ) =>
            currentProducts.filter(
              (
                currentProduct,
              ) =>
                currentProduct._id !==
                product._id,
            ),
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo eliminar el producto.";

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

        setProductsError(
          message,
        );
      } finally {
        setDeletingProductId(
          null,
        );
      }
    };

  /* ========================================
     PANEL
  ======================================== */

  return (
    <main className="admin-dashboard">
      <div className="admin-dashboard__container">

        {/* =================================
            HEADER
        ================================= */}

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
            className="admin-dashboard__nav-link admin-dashboard__nav-link--active"
            aria-current="page"
          >
            Productos
          </Link>

          <Link
            to="/admin/pedidos"
            className="admin-dashboard__nav-link"
          >
            Pedidos
          </Link>
        </nav>

        {/* =================================
            PRODUCTOS
        ================================= */}

        <section className="admin-products">

          {/* =================================
              HEADER CATÁLOGO
          ================================= */}

          <header className="admin-products__header">
            <div>
              <span className="admin-products__eyebrow">
                Catálogo
              </span>

              <h2>
                Productos
              </h2>

              <p>
                Administrá los
                productos disponibles
                en Loongis.
              </p>
            </div>

            <div className="admin-products__header-actions">

              {!productsLoading &&
                !productsError && (
                  <span className="admin-products__count">
                    {
                      products.length
                    }{" "}
                    {products.length ===
                    1
                      ? "producto"
                      : "productos"}
                  </span>
                )}

              <Link
                to="/admin/productos/nuevo/editar"
                className="admin-products__new"
              >
                + Nuevo producto
              </Link>
            </div>
          </header>

          {/* =================================
              ERROR
          ================================= */}

          {productsError && (
            <div
              className="admin-products__error"
              role="alert"
            >
              <strong>
                Ocurrió un problema
              </strong>

              <span>
                {
                  productsError
                }
              </span>
            </div>
          )}

          {/* =================================
              CARGANDO
          ================================= */}

          {productsLoading && (
            <div className="admin-products__message">
              Cargando productos...
            </div>
          )}

          {/* =================================
              LISTADO
          ================================= */}

          {!productsLoading &&
            products.length >
              0 && (
              <div className="admin-products__list">

                {products.map(
                  (
                    product,
                  ) => {
                    const isDeleting =
                      deletingProductId ===
                      product._id;

                    return (
                      <article
                        key={
                          product._id
                        }
                        className="admin-product"
                      >

                        {/* =====================
                            IMAGEN
                        ===================== */}

                        <div className="admin-product__image-wrapper">
                          <img
                            src={
                              product.image
                            }
                            alt={
                              product.imageAlt
                            }
                            className="admin-product__image"
                          />
                        </div>

                        {/* =====================
                            CONTENIDO
                        ===================== */}

                        <div className="admin-product__content">

                          <div className="admin-product__top">
                            <div>
                              <span className="admin-product__category">
                                {product
                                  .category
                                  ?.name ??
                                  "Sin categoría"}
                              </span>

                              <h3>
                                {
                                  product.name
                                }
                              </h3>
                            </div>

                            <strong className="admin-product__price">
                              {formatPrice(
                                product.price,
                              )}
                            </strong>
                          </div>

                          <p className="admin-product__description">
                            {
                              product.description
                            }
                          </p>

                          {/* ===================
                              META
                          =================== */}

                          <div className="admin-product__meta">

                            <span
                              className={
                                product.active
                                  ? "admin-product__status admin-product__status--active"
                                  : "admin-product__status admin-product__status--inactive"
                              }
                            >
                              {product.active
                                ? "Activo"
                                : "Inactivo"}
                            </span>

                            {product.featured && (
                              <span className="admin-product__featured">
                                Destacado
                              </span>
                            )}

                            {product.legacyId !==
                              undefined && (
                              <span className="admin-product__id">
                                ID{" "}
                                {
                                  product.legacyId
                                }
                              </span>
                            )}
                          </div>

                          {/* ===================
                              ACCIONES
                          =================== */}

                          <div className="admin-product__actions">

                            <Link
                              to={`/admin/productos/${product._id}/editar`}
                              className="admin-product__edit"
                            >
                              Editar
                            </Link>

                            <button
                              type="button"
                              className="admin-product__delete"
                              onClick={() =>
                                void handleDeleteProduct(
                                  product,
                                )
                              }
                              disabled={
                                isDeleting
                              }
                            >
                              {isDeleting
                                ? "Eliminando..."
                                : "Eliminar"}
                            </button>

                          </div>
                        </div>
                      </article>
                    );
                  },
                )}
              </div>
            )}

          {/* =================================
              VACÍO
          ================================= */}

          {!productsLoading &&
            !productsError &&
            products.length ===
              0 && (
              <div className="admin-products__message">
                Todavía no hay
                productos cargados.
              </div>
            )}

        </section>
      </div>
    </main>
  );
}