import {
  useEffect,
} from "react";

import {
  useLocation,
} from "react-router-dom";

import {
  getProductById,
} from "../services/productsApi";

/* ========================================
   CONFIGURACIÓN GENERAL
======================================== */

const SITE_NAME =
  "Loongis";

const SITE_URL =
  "https://loongis-web.vercel.app";

const DEFAULT_DESCRIPTION =
  "Hamburguesas artesanales, combos, papas y mucho sabor. Conocé el menú de Loongis y armá tu pedido online.";

const DEFAULT_SOCIAL_IMAGE =
  `${SITE_URL}/images/burgers/combo-promo.png`;

const DEFAULT_SOCIAL_IMAGE_ALT =
  "Combo de hamburguesa, papas y bebida de Loongis";

/* ========================================
   TIPOS
======================================== */

type SeoInformation = {
  title: string;
  description: string;
  canonicalPath: string;
  robots: string;

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
) {
  let metaTag =
    document.head.querySelector(
      `meta[${attribute}="${attributeValue}"]`,
    ) as HTMLMetaElement | null;

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
) {
  let canonicalLink =
    document.head.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement | null;

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
   SEO ESTÁTICO
======================================== */

function getStaticSeoInformation(
  pathname: string,
): SeoInformation {
  switch (pathname) {
    case "/":
      return {
        title:
          "Hamburguesas artesanales | Loongis",

        description:
          DEFAULT_DESCRIPTION,

        canonicalPath: "/",

        robots:
          "index, follow",
      };

    case "/menu":
      return {
        title:
          "Menú de hamburguesas y combos | Loongis",

        description:
          "Explorá el menú completo de Loongis: hamburguesas, combos, papas, bebidas y postres.",

        canonicalPath:
          "/menu",

        robots:
          "index, follow",
      };

    case "/carrito":
      return {
        title:
          `Mi pedido | ${SITE_NAME}`,

        description:
          "Revisá los productos agregados a tu pedido de Loongis.",

        canonicalPath:
          "/carrito",

        robots:
          "noindex, nofollow",
      };

    case "/finalizar-pedido":
      return {
        title:
          "Finalizar pedido | Loongis",

        description:
          "Completá los datos de entrega y confirmá tu pedido de Loongis por WhatsApp.",

        canonicalPath:
          "/finalizar-pedido",

        robots:
          "noindex, nofollow",
      };

    default:
      return {
        title:
          "Página no encontrada | Loongis",

        description:
          "La página que intentaste visitar no existe.",

        canonicalPath:
          pathname,

        robots:
          "noindex, nofollow",
      };
  }
}

/* ========================================
   APLICAR SEO
======================================== */

function applySeoInformation(
  seoInformation:
    SeoInformation,
) {
  const canonicalUrl =
    `${SITE_URL}${seoInformation.canonicalPath}`;

  const socialImage =
    seoInformation.socialImage ??
    DEFAULT_SOCIAL_IMAGE;

  const socialImageAlt =
    seoInformation.socialImageAlt ??
    DEFAULT_SOCIAL_IMAGE_ALT;

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

  /* ========================================
     OPEN GRAPH
  ======================================== */

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
    "website",
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

  /* ========================================
     TWITTER
  ======================================== */

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

  updateCanonicalLink(
    canonicalUrl,
  );
}

/* ========================================
   COMPONENTE
======================================== */

export function PageTitle() {
  const {
    pathname,
  } = useLocation();

  useEffect(() => {
    let isMounted =
      true;

    async function updateSeo() {
      /* ====================================
         PRODUCTO
      ==================================== */

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
              "noindex, nofollow",
          });

          return;
        }

        try {
          const product =
            await getProductById(
              productId,
            );

          if (!isMounted) {
            return;
          }

          applySeoInformation({
            title:
              `${product.name} | ${SITE_NAME}`,

            description:
              `${product.description} Pedila online en Loongis.`,

            canonicalPath:
              `/producto/${product.id}`,

            robots:
              product.available !==
              false
                ? "index, follow"
                : "noindex, nofollow",

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
              "noindex, nofollow",
          });

          return;
        }
      }

      /* ====================================
         PÁGINAS ESTÁTICAS
      ==================================== */

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
      isMounted = false;
    };
  }, [pathname]);

  return null;
}