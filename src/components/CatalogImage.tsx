import type {
  ImgHTMLAttributes,
} from "react";

/* ========================================
   VARIANTES
======================================== */

type CatalogImageVariant =
  | "card"
  | "full";

/* ========================================
   METADATA DE IMÁGENES OPTIMIZADAS
======================================== */

type OptimizedImageInformation = {
  fullWidth: number;
  fullHeight: number;

  cardWidth: number;
  cardHeight: number;
};

const optimizedImages:
  Record<
    string,
    OptimizedImageInformation
  > = {
  "combo-bacon.png": {
    fullWidth: 720,
    fullHeight: 1080,
    cardWidth: 360,
    cardHeight: 540,
  },

  "combo-crispy.png": {
    fullWidth: 720,
    fullHeight: 1080,
    cardWidth: 360,
    cardHeight: 540,
  },

  "combo-promo.png": {
    fullWidth: 720,
    fullHeight: 1080,
    cardWidth: 360,
    cardHeight: 540,
  },

  "combo-simplequeso.png": {
    fullWidth: 720,
    fullHeight: 1080,
    cardWidth: 360,
    cardHeight: 540,
  },

  "loongis-bacon.png": {
    fullWidth: 650,
    fullHeight: 1080,
    cardWidth: 360,
    cardHeight: 598,
  },

  "loongis-clasic.png": {
    fullWidth: 650,
    fullHeight: 1080,
    cardWidth: 360,
    cardHeight: 598,
  },

  "loongis-crispy.png": {
    fullWidth: 650,
    fullHeight: 1080,
    cardWidth: 360,
    cardHeight: 598,
  },

  "simple-queso.png": {
    fullWidth: 650,
    fullHeight: 1080,
    cardWidth: 360,
    cardHeight: 598,
  },
};

/* ========================================
   PROPS
======================================== */

type CatalogImageProps =
  Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    | "src"
    | "srcSet"
    | "alt"
    | "width"
    | "height"
  > & {
    src: string;
    alt: string;

    variant?:
      CatalogImageVariant;
  };

/* ========================================
   OBTENER NOMBRE DE ARCHIVO
======================================== */

function getImageFileName(
  src: string,
): string {
  const cleanPath =
    src
      .split("?")[0]
      .split("#")[0];

  const fileName =
    cleanPath
      .split("/")
      .pop() ??
    "";

  /*
    También soportamos que en algún punto
    product.image ya venga como WebP.
  */

  if (
    fileName.endsWith(
      "-360.webp",
    )
  ) {
    return fileName.replace(
      /-360\.webp$/i,
      ".png",
    );
  }

  if (
    fileName.endsWith(
      ".webp",
    )
  ) {
    return fileName.replace(
      /\.webp$/i,
      ".png",
    );
  }

  return fileName;
}

/* ========================================
   RUTA WEBP COMPLETA
======================================== */

function getFullWebpPath(
  src: string,
): string {
  if (
    src.match(
      /-360\.webp(?=([?#]|$))/i,
    )
  ) {
    return src.replace(
      /-360\.webp(?=([?#]|$))/i,
      ".webp",
    );
  }

  if (
    src.match(
      /\.webp(?=([?#]|$))/i,
    )
  ) {
    return src;
  }

  return src.replace(
    /\.png(?=([?#]|$))/i,
    ".webp",
  );
}

/* ========================================
   RUTA WEBP CARD
======================================== */

function getCardWebpPath(
  src: string,
): string {
  const fullPath =
    getFullWebpPath(
      src,
    );

  return fullPath.replace(
    /\.webp(?=([?#]|$))/i,
    "-360.webp",
  );
}

/* ========================================
   COMPONENTE
======================================== */

export function CatalogImage({
  src,
  alt,
  variant = "card",
  decoding = "async",
  ...imageProps
}: CatalogImageProps) {
  const fileName =
    getImageFileName(
      src,
    );

  const imageInformation =
    optimizedImages[
      fileName
    ];

  /* ========================================
     FALLBACK
  ======================================== */

  /*
    Si mañana agregamos un producto nuevo
    desde el admin y todavía no existe su
    versión WebP, seguimos usando la imagen
    original.

    Así el catálogo nunca se rompe.
  */

  if (
    !imageInformation
  ) {
    return (
      <img
        {...imageProps}
        src={src}
        alt={alt}
        decoding={
          decoding
        }
      />
    );
  }

  /* ========================================
     RUTAS
  ======================================== */

  const fullImage =
    getFullWebpPath(
      src,
    );

  const cardImage =
    getCardWebpPath(
      src,
    );

  /* ========================================
     DIMENSIONES
  ======================================== */

  const width =
    variant === "card"
      ? imageInformation.cardWidth
      : imageInformation.fullWidth;

  const height =
    variant === "card"
      ? imageInformation.cardHeight
      : imageInformation.fullHeight;

  /* ========================================
     SRC PRINCIPAL
  ======================================== */

  const primaryImage =
    variant === "card"
      ? cardImage
      : fullImage;

  return (
    <img
      {...imageProps}
      src={
        primaryImage
      }
      srcSet={`${cardImage} 360w, ${fullImage} ${imageInformation.fullWidth}w`}
      alt={alt}
      width={width}
      height={height}
      decoding={
        decoding
      }
    />
  );
}