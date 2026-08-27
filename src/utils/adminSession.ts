const ADMIN_TOKEN_KEY =
  "loongis_admin_token";

/* ========================================
   OBTENER TOKEN
======================================== */

export function getAdminToken():
  | string
  | null {
  return sessionStorage.getItem(
    ADMIN_TOKEN_KEY,
  );
}

/* ========================================
   GUARDAR TOKEN
======================================== */

export function saveAdminToken(
  token: string,
): void {
  sessionStorage.setItem(
    ADMIN_TOKEN_KEY,
    token,
  );
}

/* ========================================
   ELIMINAR TOKEN
======================================== */

export function removeAdminToken():
  void {
  sessionStorage.removeItem(
    ADMIN_TOKEN_KEY,
  );
}