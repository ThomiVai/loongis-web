import { Link, useLocation } from "react-router-dom";
import type { Admin } from "../services/adminAuthApi";
import "../styles/AdminNavigation.css";

type AdminDestination = {
  label: string;
  to: string;
  active?: (pathname: string) => boolean;
  ownerOnly?: boolean;
};

export function AdminNavigation({ admin }: { admin: Admin }) {
  const { pathname } = useLocation();
  const sections: AdminDestination[] = [
    { label: "Cocina", to: "/admin/cocina", active: (path) => path === "/admin" || path === "/admin/cocina" },
    { label: "Pedidos", to: "/admin/pedidos" },
    { label: "Productos", to: "/admin/productos" },
    { label: "Ventas", to: "/admin/ventas" },
    { label: "Inventario", to: "/admin/inventario" },
    { label: "Centro de stock", to: "/admin/stock" },
    { label: "Recetas", to: "/admin/recetas", ownerOnly: true },
    { label: "Accesos", to: "/admin/usuarios", ownerOnly: true },
  ];

  return (
    <div className="admin-navigation-shell">
      <nav className="admin-navigation" aria-label="Secciones del panel administrador">
        {sections.filter((section) => !section.ownerOnly || admin.role === "owner").map((section) => {
          const active = section.active ? section.active(pathname) : pathname === section.to || pathname.startsWith(`${section.to}/`);
          return (
            <Link
              key={section.to}
              to={section.to}
              className={`admin-navigation__link${active ? " admin-navigation__link--active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {section.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
