const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN || "localhost";
const ROOT_DOMAIN = APP_DOMAIN.split(":")[0];

export function getSubdomain(): string | null {
  const hostname = window.location.hostname;

  if (hostname === ROOT_DOMAIN) {
    return null;
  }

  const suffix = `.${ROOT_DOMAIN}`;
  if (hostname.endsWith(suffix)) {
    const subdomain = hostname.slice(0, -suffix.length);
    return subdomain === "www" ? null : subdomain;
  }

  return null;
}

export function isRootDomain() {
  return getSubdomain() === null;
}
