import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { menuProducts } from "../data/menuProducts";

const SITE_NAME = "Loongis";
const SITE_URL =
  "https://loongis-web.vercel.app";

const DEFAULT_DESCRIPTION =
  "Hamburguesas artesanales, combos, papas y mucho sabor. Conocé el menú de Loongis y armá tu pedido online.";

const DEFAULT_SOCIAL_IMAGE =
  `${SITE_URL}/images/promo/combo-loongis.png`;

type SeoInformation = {
  title: string;
  description: string;
  canonicalPath: string;
  robots: string;
};

function updateMetaTag(
  attribute: "name" | "property",
  attributeValue: string,
  content: string,
) {
  let metaTag = document.head.querySelector(
    `meta[${attribute}="${attributeValue}"]`,
  ) as HTMLMetaElement | null;

  if (!metaTag) {
    metaTag = document.createElement("meta");

    metaTag.setAttribute(
      attribute,
      attributeValue,
    );

    document.head.appendChild(metaTag);
  }

  metaTag.content = content;
}

function updateCanonicalLink(url: string) {
  let canonicalLink = document.head.querySelector(
    'link[rel="canonical"]',
  ) as HTMLLinkElement | null;

  if (!canonicalLink) {
    canonicalLink =
      document.createElement("link");

    canonicalLink.rel = "canonical";

    document.head.appendChild(
      canonicalLink,
    );
  }

  canonicalLink.href = url;
}

function getSeoInformation(
  pathname: string,
): SeoInformation {
  if (pathname.startsWith("/producto/")) {
    const productId = Number(
      pathname.split("/")[2],
    );

    const product = menuProducts.find(
      (currentProduct) =>
        currentProduct.id === productId,
    );

    if (product) {
      return {
        title: `${product.name} | ${SITE_NAME}`,
        description: `${product.description} Pedila online en Loongis.`,
        canonicalPath: `/producto/${product.id}`,
        robots: "index, follow",
      };
    }

    return {
      title: `Producto no encontrado | ${SITE_NAME}`,
      description:
        "El producto que intentaste visitar no se encuentra disponible.",
      canonicalPath: pathname,
      robots: "noindex, nofollow",
    };
  }

  switch (pathname) {
    case "/":
      return {
        title:
          "Hamburguesas artesanales | Loongis",
        description:
          DEFAULT_DESCRIPTION,
        canonicalPath: "/",
        robots: "index, follow",
      };

    case "/menu":
      return {
        title:
          "Menú de hamburguesas y combos | Loongis",
        description:
          "Explorá el menú completo de Loongis: hamburguesas, combos, papas, bebidas y postres.",
        canonicalPath: "/menu",
        robots: "index, follow",
      };

    case "/carrito":
      return {
        title: `Mi pedido | ${SITE_NAME}`,
        description:
          "Revisá los productos agregados a tu pedido de Loongis.",
        canonicalPath: "/carrito",
        robots: "noindex, nofollow",
      };

    case "/finalizar-pedido":
      return {
        title:
          "Finalizar pedido | Loongis",
        description:
          "Completá los datos de entrega y confirmá tu pedido de Loongis por WhatsApp.",
        canonicalPath:
          "/finalizar-pedido",
        robots: "noindex, nofollow",
      };

    default:
      return {
        title:
          "Página no encontrada | Loongis",
        description:
          "La página que intentaste visitar no existe.",
        canonicalPath: pathname,
        robots: "noindex, nofollow",
      };
  }
}

export function PageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seoInformation =
      getSeoInformation(pathname);

    const canonicalUrl =
      `${SITE_URL}${seoInformation.canonicalPath}`;

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
      DEFAULT_SOCIAL_IMAGE,
    );

    updateMetaTag(
      "property",
      "og:image:alt",
      "Combo de hamburguesa, papas y bebida de Loongis",
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
      DEFAULT_SOCIAL_IMAGE,
    );

    updateCanonicalLink(canonicalUrl);
  }, [pathname]);

  return null;
}