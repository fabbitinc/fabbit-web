const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const TOKEN_COOKIE_PREFIX = "fabbit_auth_";
const COOKIE_MAX_AGE = 60;
const LOGOUT_COOKIE = "fabbit_logged_out";
const LOGOUT_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

const isSecure = window.location.protocol === "https:";

function getRootDomain() {
  const domain = import.meta.env.VITE_APP_DOMAIN || "localhost";
  return domain.split(":")[0];
}

export function setStoredTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function getStoredTokens() {
  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

export function clearStoredTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function setAuthCookies(accessToken: string, refreshToken: string) {
  const domain = getRootDomain();
  const options = `domain=.${domain}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${isSecure ? "; Secure" : ""}`;

  document.cookie = `${TOKEN_COOKIE_PREFIX}access=${accessToken}; ${options}`;
  document.cookie = `${TOKEN_COOKIE_PREFIX}refresh=${refreshToken}; ${options}`;
}

export function getAuthCookies() {
  const cookies = document.cookie.split("; ");
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  for (const cookie of cookies) {
    if (cookie.startsWith(`${TOKEN_COOKIE_PREFIX}access=`)) {
      accessToken = cookie.substring(`${TOKEN_COOKIE_PREFIX}access=`.length);
    }

    if (cookie.startsWith(`${TOKEN_COOKIE_PREFIX}refresh=`)) {
      refreshToken = cookie.substring(`${TOKEN_COOKIE_PREFIX}refresh=`.length);
    }
  }

  return { accessToken, refreshToken };
}

export function clearAuthCookies() {
  const domain = getRootDomain();
  document.cookie = `${TOKEN_COOKIE_PREFIX}access=; domain=.${domain}; path=/; max-age=0`;
  document.cookie = `${TOKEN_COOKIE_PREFIX}refresh=; domain=.${domain}; path=/; max-age=0`;
}

export function setLogoutCookie() {
  const domain = getRootDomain();
  document.cookie = `${LOGOUT_COOKIE}=1; domain=.${domain}; path=/; max-age=${LOGOUT_COOKIE_MAX_AGE}; SameSite=Lax${isSecure ? "; Secure" : ""}`;
}

export function hasLogoutCookie() {
  return document.cookie.split("; ").some((cookie) => cookie.startsWith(`${LOGOUT_COOKIE}=`));
}

export function clearLogoutCookie() {
  const domain = getRootDomain();
  document.cookie = `${LOGOUT_COOKIE}=; domain=.${domain}; path=/; max-age=0`;
}
