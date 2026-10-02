export const SESSION_KEY = "loongis_welcome_seen";

export function shouldShowWelcome(pathname: string) {
  if (pathname !== "/") return false;
  try {
    return sessionStorage.getItem(SESSION_KEY) !== "1";
  } catch {
    return true;
  }
}

