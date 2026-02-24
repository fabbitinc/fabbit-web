const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN || "localhost";
const ROOT_DOMAIN = APP_DOMAIN.split(":")[0]; // 포트 제거

/**
 * register 서브도메인 또는 루트 도메인(localhost 등)인지 판별합니다.
 * - `register.lvh.me` → `true`
 * - `lvh.me` / `localhost` → `true` (로컬 개발 호환)
 * - `myworkspace.lvh.me` → `false`
 */
export function isRegisterDomain(): boolean {
  const sub = getSubdomain();
  return sub === null || sub === "register";
}

export function getSubdomain(): string | null {
  const hostname = window.location.hostname;

  // 루트 도메인 자체인 경우
  if (hostname === ROOT_DOMAIN) {
    return null;
  }

  // .rootDomain 으로 끝나는 경우 서브도메인 추출
  const suffix = `.${ROOT_DOMAIN}`;
  if (hostname.endsWith(suffix)) {
    const sub = hostname.slice(0, -suffix.length);
    // www는 메인 도메인 취급
    if (sub === "www") return null;
    return sub;
  }

  return null;
}
