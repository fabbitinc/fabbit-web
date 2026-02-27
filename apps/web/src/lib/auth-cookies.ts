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
