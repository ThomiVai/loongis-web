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
  useOutletContext,
} from "react-router-dom";

import type {
  ProtectedAdminOutletContext,
} from "../components/ProtectedAdminRoute";

import {
  changeAdminPassword,
} from "../services/adminAuthApi";

import {
  createAdminUser,
  getAdminUsers,
  updateAdminUser,
} from "../services/adminUsersApi";

import type {
  AdminUser,
} from "../services/adminUsersApi";

import {
  getAdminToken,
  removeAdminToken,
} from "../utils/adminSession";

import "../styles/AdminDashboard.css";
import "../styles/AdminStockCenter.css";

export function AdminUsers() {
  const navigate =
    useNavigate();
  const { admin } =
    useOutletContext<ProtectedAdminOutletContext>();
  const token =
    getAdminToken();

  const [users, setUsers] =
    useState<AdminUser[]>([]);
  const [email, setEmail] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [role, setRole] =
    useState<"owner" | "manager">("manager");
  const [currentPassword, setCurrentPassword] =
    useState("");
  const [newPassword, setNewPassword] =
    useState("");
  const [saving, setSaving] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);
  const [message, setMessage] =
    useState<string | null>(null);

  useEffect(() => {
    if (
      !token ||
      admin.role !== "owner"
    ) {
      return;
    }

    void getAdminUsers(token)
      .then(setUsers)
      .catch((loadError: unknown) =>
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar los accesos.",
        ),
      );
  }, [admin.role, token]);

  if (admin.role !== "owner") {
    return (
      <Navigate
        to="/admin/inventario"
        replace
      />
    );
  }

  const saveUser =
    async (
      event: FormEvent,
    ) => {
      event.preventDefault();
      if (!token) return;

      setSaving(true);
      setError(null);
      setMessage(null);
      try {
        const created =
          await createAdminUser(
            token,
            { email, password, role },
          );
        setUsers((current) => [
          ...current,
          created,
        ]);
        setEmail("");
        setPassword("");
        setRole("manager");
        setMessage(
          "Acceso creado. Entregá la contraseña temporal de forma privada.",
        );
      } catch (saveError) {
        setError(
          saveError instanceof Error
            ? saveError.message
            : "No se pudo crear el acceso.",
        );
      } finally {
        setSaving(false);
      }
    };

  const patchUser =
    async (
      user: AdminUser,
      patch: {
        role?: "owner" | "manager";
        active?: boolean;
      },
    ) => {
      if (!token) return;
      setError(null);
      try {
        const updated =
          await updateAdminUser(
            token,
            user._id,
            patch,
          );
        setUsers((current) =>
          current.map((item) =>
            item._id === updated._id
              ? updated
              : item,
          ),
        );
      } catch (updateError) {
        setError(
          updateError instanceof Error
            ? updateError.message
            : "No se pudo actualizar el acceso.",
        );
      }
    };

  const changePassword =
    async (
      event: FormEvent,
    ) => {
      event.preventDefault();
      if (!token) return;
      setSaving(true);
      setError(null);
      try {
        setMessage(
          await changeAdminPassword(
            token,
            currentPassword,
            newPassword,
          ),
        );
        setCurrentPassword("");
        setNewPassword("");
      } catch (passwordError) {
        setError(
          passwordError instanceof Error
            ? passwordError.message
            : "No se pudo cambiar la contraseña.",
        );
      } finally {
        setSaving(false);
      }
    };

  const logout = () => {
    removeAdminToken();
    navigate("/admin/login", { replace: true });
  };

  return (
    <main className="admin-dashboard">
      <div className="admin-dashboard__container">
        <header className="admin-dashboard__header">
          <div>
            <span className="admin-dashboard__eyebrow">Seguridad</span>
            <h1>Accesos administrativos</h1>
            <p>Cada persona usa su propia cuenta.</p>
          </div>
          <div className="admin-dashboard__header-actions">
            <Link to="/" className="admin-dashboard__store-link">← Volver a la tienda</Link>
            <button type="button" className="admin-dashboard__logout" onClick={logout}>Cerrar sesión</button>
          </div>
        </header>

        <nav className="admin-dashboard__nav">
          <Link to="/admin" className="admin-dashboard__nav-link">Productos</Link>
          <Link to="/admin/pedidos" className="admin-dashboard__nav-link">Pedidos</Link>
          <Link to="/admin/inventario" className="admin-dashboard__nav-link">Inventario</Link>
          <Link to="/admin/stock" className="admin-dashboard__nav-link">Centro de stock</Link>
          <Link to="/admin/recetas" className="admin-dashboard__nav-link">Recetas</Link>
          <Link to="/admin/usuarios" className="admin-dashboard__nav-link admin-dashboard__nav-link--active">Accesos</Link>
        </nav>

        {error && <div className="admin-stock__message admin-stock__message--error" role="alert">{error}</div>}
        {message && <div className="admin-stock__message admin-stock__message--success" role="status">{message}</div>}

        <section className="admin-stock__grid">
          <article className="admin-stock__panel">
            <header><h2>Crear acceso</h2><p>No existe registro público.</p></header>
            <form className="admin-stock__form" onSubmit={saveUser}>
              <label><span>Correo</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
              <label><span>Contraseña temporal</span><input type="password" minLength={10} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
              <label><span>Rol</span><select value={role} onChange={(event) => setRole(event.target.value as "owner" | "manager")}><option value="manager">Encargado</option><option value="owner">Dueño</option></select></label>
              <button className="admin-stock__primary" disabled={saving}>Crear acceso</button>
            </form>
          </article>

          <article className="admin-stock__panel">
            <header><h2>Cambiar mi contraseña</h2></header>
            <form className="admin-stock__form" onSubmit={changePassword}>
              <label><span>Contraseña actual</span><input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label>
              <label><span>Nueva contraseña</span><input type="password" minLength={10} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></label>
              <button className="admin-stock__primary" disabled={saving}>Actualizar contraseña</button>
            </form>
          </article>
        </section>

        <section className="admin-stock__panel">
          <header><h2>Personas con acceso</h2></header>
          <div className="admin-stock__users">
            {users.map((user) => (
              <article key={user._id}>
                <div><strong>{user.email}</strong><span>{user.active ? "Activo" : "Desactivado"}</span></div>
                <select value={user.role} onChange={(event) => void patchUser(user, { role: event.target.value as "owner" | "manager" })} disabled={user._id === admin.id}>
                  <option value="manager">Encargado</option>
                  <option value="owner">Dueño</option>
                </select>
                <button type="button" className="admin-stock__secondary" onClick={() => void patchUser(user, { active: !user.active })} disabled={user._id === admin.id}>
                  {user.active ? "Desactivar" : "Activar"}
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
