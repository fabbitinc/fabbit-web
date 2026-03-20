/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 웹 앱 기본 URL (예: http://localhost:5173, https://app.fabbit.io) */
  readonly VITE_APP_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
