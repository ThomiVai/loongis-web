import {
  useEffect,
} from "react";

import {
  useLocation,
} from "react-router-dom";

import {
  getCachedProducts,
  getProductById,
} from "../services/productsApi";

import type {
  Product,
} from "../types/Product";

/* ========================================
   CONFIGURACIÓN GENERAL
======================================== */

const SITE_NAME =
  "Loongis";

const SITE_URL =
  "https://loongis-web.vercel.app";

const DEFAULT_TITLE =
  "Loongis | Hamburguesas smash en Hurlingham";

const DEFAULT_DESCRIPTION =
  "Hamburguesas smash con papas en Hurlingham. Conocé el menú de Loongis, personalizá tu favorita y pedila con delivery.";

const DEFAULT_SOCIAL_IMAGE =
  `${SITE_URL}/images/burgers/combo-promo.png`;

const DEFAULT_SOCIAL_IMAGE_ALT =
  "Combo de hamburguesa smash de Loongis";

/* ========================================
   TIPOS
======================================== */

type OpenGraphType =
  | "website"
  | "product";

type SeoInformation = {
  title: string;

  description: string;

  canonicalPath: string;

  robots: string;

  ogType?: OpenGraphType;

  socialImage?: string;

  socialImageAlt?: string;
};

/* ========================================
   META TAG
======================================== */

function updateMetaTag(
  attribute:
    | "name"
    | "property",

  attributeValue: string,

  content: string,
): void {
  let metaTag =
    document.head.querySelector(
      `meta[${attribute}="${attributeValue}"]`,
    ) as
      | HTMLMetaElement
      | null;

  if (!metaTag) {
    metaTag =
      document.createElement(
        "meta",
      );

    metaTag.setAttribute(
      attribute,
      attributeValue,
    );

    document.head.appendChild(
      metaTag,
    );
  }

  metaTag.content =
    content;
}

/* ========================================
   CANONICAL
======================================== */

function updateCanonicalLink(
  url: string,
): void {
  let canonicalLink =
    document.head.querySelector(
      'link[rel="canonical"]',
    ) as
      | HTMLLinkElement
      | null;

  if (!canonicalLink) {
    canonicalLink =
      document.createElement(
        "link",
      );

    canonicalLink.rel =
      "canonical";

    document.head.appendChild(
      canonicalLink,
    );
  }

  canonicalLink.href =
    url;
}

/* ========================================
   URL DE IMAGEN
======================================== */

function getAbsoluteImageUrl(
  image: string,
): string {
  if (
    image.startsWith(
      "http://",
    ) ||
    image.startsWith(
      "https://",
    )
  ) {
    return image;
  }

  if (
    image.startsWith("/")
  ) {
    return `${SITE_URL}${image}`;
  }

  return `${SITE_URL}/${image}`;
}

/* ========================================
   PRODUCTO PARA SEO
======================================== */

async function getProductForSeo(
  productId: number,
): Promise<Product> {
  /*
    Primero revisamos el catálogo
    guardado en el navegador.

    En la mayoría de las visitas esto
    evita otra consulta al backend.
  */

  const cachedProduct =
    getCachedProducts().find(
      (product) =>
        product.id ===
        productId,
    );

  if (cachedProduct) {
    return cachedProduct;
  }

  /*
    Primera visita sin caché.

    getProductById también tiene
    deduplicación de solicitudes, por lo
    que ProductDetail y PageTitle pueden
    compartir la misma petición si se
    ejecutan simultáneamente.
  */

  return getProductById(
    productId,
  );
}

/* ========================================
   SEO ESTÁTICO
======================================== */

function getStaticSeoInformation(
  pathname: string,
): SeoInformation {
  /* =====================================
     HOME
  ===================================== */

  if (
    pathname === "/"
  ) {
    return {
      title:
        DEFAULT_TITLE,

      description:
        DEFAULT_DESCRIPTION,

      canonicalPath:
        "/",

      robots:
        "index, follow",

      ogType:
        "website",
    };
  }

  /* =====================================
     MENÚ
  ===================================== */

  if (
    pathname === "/menu"
  ) {
    return {
      title:
        "Menú Loongis | Hamburguesas smash en Hurlingham",

      description:
        "Conocé el menú de Loongis en Hurlingham. Elegí tu hamburguesa smash o combo, personalizalo y armá tu pedido online.",

      canonicalPath:
        "/menu",

      robots:
        "index, follow",

      ogType:
        "website",
    };
  }

  /* =====================================
     CARRITO
  ===================================== */

  if (
    pathname === "/carrito"
  ) {
    return {
      title:
        `Mi pedido | ${SITE_NAME}`,

      description:
        "Revisá los productos, cantidades y personalizaciones de tu pedido de Loongis.",

      canonicalPath:
        "/carrito",

      robots:
        "noindex, nofollow, noarchive",

      ogType:
        "website",
    };
  }

  /* =====================================
     CHECKOUT
  ===================================== */

  if (
    pathname ===
    "/finalizar-pedido"
  ) {
    return {
      title:
        `Finalizar pedido | ${SITE_NAME}`,

      description:
        "Completá los datos de entrega y prepará tu pedido de Loongis para enviarlo por WhatsApp.",

      canonicalPath:
        "/finalizar-pedido",

      robots:
        "noindex, nofollow, noarchive",

      ogType:
        "website",
    };
  }

  /* =====================================
     ADMIN
  ===================================== */

  if (
    pathname.startsWith(
      "/admin",
    )
  ) {
    return {
      title:
        `Administración | ${SITE_NAME}`,

      description:
        "Panel de administración de Loongis.",

      canonicalPath:
        pathname,

      robots:
        "noindex, nofollow, noarchive",

      ogType:
        "website",
    };
  }

  /* =====================================
     404
  ===================================== */

  return {
    title:
      `Página no encontrada | ${SITE_NAME}`,

    description:
      "La página que intentaste visitar no existe.",

    canonicalPath:
      pathname,

    robots:
      "noindex, nofollow, noarchive",

    ogType:
      "website",
  };
}

/* ========================================
   APLICAR SEO
======================================== */

function applySeoInformation(
  seoInformation:
    SeoInformation,
): void {
  const canonicalUrl =
    `${SITE_URL}${seoInformation.canonicalPath}`;

  const socialImage =
    seoInformation.socialImage ??
    DEFAULT_SOCIAL_IMAGE;

  const socialImageAlt =
    seoInformation.socialImageAlt ??
    DEFAULT_SOCIAL_IMAGE_ALT;

  const ogType =
    seoInformation.ogType ??
    "website";

  /* =====================================
     HTML
  ===================================== */

  document.title =
    seoInformation.title;

  updateMetaTag(
    "name",
    "description",
    seoInformation.description,
  );

  updateMetaTag(
    "name",
    "robots",
    seoInformation.robots,
  );

  updateCanonicalLink(
    canonicalUrl,
  );

  /* =====================================
     OPEN GRAPH
  ===================================== */

  updateMetaTag(
    "property",
    "og:title",
    seoInformation.title,
  );

  updateMetaTag(
    "property",
    "og:description",
    seoInformation.description,
  );

  updateMetaTag(
    "property",
    "og:type",
    ogType,
  );

  updateMetaTag(
    "property",
    "og:url",
    canonicalUrl,
  );

  updateMetaTag(
    "property",
    "og:image",
    socialImage,
  );

  updateMetaTag(
    "property",
    "og:image:alt",
    socialImageAlt,
  );

  updateMetaTag(
    "property",
    "og:site_name",
    SITE_NAME,
  );

  updateMetaTag(
    "property",
    "og:locale",
    "es_AR",
  );

  /* =====================================
     TWITTER / X
  ===================================== */

  updateMetaTag(
    "name",
    "twitter:card",
    "summary_large_image",
  );

  updateMetaTag(
    "name",
    "twitter:title",
    seoInformation.title,
  );

  updateMetaTag(
    "name",
    "twitter:description",
    seoInformation.description,
  );

  updateMetaTag(
    "name",
    "twitter:image",
    socialImage,
  );

  updateMetaTag(
    "name",
    "twitter:image:alt",
    socialImageAlt,
  );
}

/* ========================================
   COMPONENTE
======================================== */

export function PageTitle() {
  const {
    pathname,
    search,
  } =
    useLocation();

  useEffect(() => {
    let isMounted =
      true;

    async function updateSeo() {
      /* ==================================
         PRODUCTO
      ================================== */

      if (
        pathname.startsWith(
          "/producto/",
        )
      ) {
        const productId =
          Number(
            pathname.split(
              "/",
            )[2],
          );

        const validProductId =
          Number.isInteger(
            productId,
          ) &&
          productId > 0;

        /* ==================================
           ID INVÁLIDO
        ================================== */

        if (
          !validProductId
        ) {
          applySeoInformation({
            title:
              `Producto no encontrado | ${SITE_NAME}`,

            description:
              "El producto que intentaste visitar no se encuentra disponible.",

            canonicalPath:
              pathname,

            robots:
              "noindex, nofollow, noarchive",

            ogType:
              "website",
          });

          return;
        }

        try {
          const product =
            await getProductForSeo(
              productId,
            );

          if (!isMounted) {
            return;
          }

          /* ==================================
             MODO EDICIÓN
          ================================== */

          const searchParams =
            new URLSearchParams(
              search,
            );

          const isEditing =
            Boolean(
              searchParams.get(
                "editar",
              ),
            );

          /*
            La URL de edición nunca debe
            indexarse.

            El canonical sigue apuntando a
            la página pública normal.
          */

          const robots =
            isEditing
              ? "noindex, nofollow, noarchive"
              : product.available !==
                  false
                ? "index, follow"
                : "noindex, nofollow";

          /* ==================================
             SEO PRODUCTO
          ================================== */

          applySeoInformation({
            title:
              `${product.name} | Loongis Hurlingham`,

            description:
              `${product.description} Personalizala y pedila online en Loongis con delivery en Hurlingham.`,

            canonicalPath:
              `/producto/${product.id}`,

            robots,

            ogType:
              "product",

            socialImage:
              getAbsoluteImageUrl(
                product.image,
              ),

            socialImageAlt:
              product.imageAlt,
          });

          return;
        } catch (error) {
          if (!isMounted) {
            return;
          }

          console.error(
            "Error cargando SEO del producto:",
            error,
          );

          applySeoInformation({
            title:
              `Producto no encontrado | ${SITE_NAME}`,

            description:
              "El producto que intentaste visitar no se encuentra disponible.",

            canonicalPath:
              pathname,

            robots:
              "noindex, nofollow, noarchive",

            ogType:
              "website",
          });

          return;
        }
      }

      /* ==================================
         PÁGINAS ESTÁTICAS
      ================================== */

      const seoInformation =
        getStaticSeoInformation(
          pathname,
        );

      applySeoInformation(
        seoInformation,
      );
    }

    void updateSeo();

    return () => {
      isMounted =
        false;
    };
  }, [
    pathname,
    search,
  ]);

  return null;
}
