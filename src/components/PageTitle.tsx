import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const pageTitles: Record<string, string> = {
  "/": "Loongis | Hamburguesas smash",
  "/menu": "Menú | Loongis",
  "/carrito": "Mi pedido | Loongis",
  "/finalizar-pedido": "Finalizar pedido | Loongis",
};

export function PageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title =
      pageTitles[pathname] ?? "Página no encontrada | Loongis";
  }, [pathname]);

  return null;
}