const TOKEN_COOKIE_PREFIX = "fabbit_auth_";
const COOKIE_MAX_AGE = 60; // 60초 (서브도메인 전환용 임시 쿠키)

function getRootDomain(): string {
  const domain = import.meta.env.VITE_APP_DOMAIN || "localhost";
  // 포트 제거 (lvh.me:5173 → lvh.me)
  return domain.split(":")[0];
}

export function setAuthCookies(accessToken: string, refreshToken: string) {
  const domain = getRootDomain();
  const opts = `domain=.${domain}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  document.cookie = `${TOKEN_COOKIE_PREFIX}access=${accessToken}; ${opts}`;
  document.cookie = `${TOKEN_COOKIE_PREFIX}refresh=${refreshToken}; ${opts}`;
}

export function getAuthCookies(): {
  accessToken: string | null;
  refreshToken: string | null;
} {
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

// 크로스 서브도메인 로그아웃 쿠키
const LOGOUT_COOKIE = "fabbit_logged_out";
const LOGOUT_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7일

export function setLogoutCookie() {
  const domain = getRootDomain();
  document.cookie = `${LOGOUT_COOKIE}=1; domain=.${domain}; path=/; max-age=${LOGOUT_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function hasLogoutCookie(): boolean {
  return document.cookie.split("; ").some((c) => c.startsWith(`${LOGOUT_COOKIE}=`));
}

export function clearLogoutCookie() {
  const domain = getRootDomain();
  document.cookie = `${LOGOUT_COOKIE}=; domain=.${domain}; path=/; max-age=0`;
}
