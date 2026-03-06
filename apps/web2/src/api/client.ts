import axios from "axios";
import { clearStoredTokens, getStoredTokens, setStoredTokens } from "@/lib/auth-cookies";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

let onUnauthorized: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

function runUnauthorizedHandler() {
  clearStoredTokens();
  onUnauthorized?.();
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const { accessToken } = getStoredTokens();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url ?? "";
    const isAuthRequest = requestUrl.includes("/api/v1/auth/login") || requestUrl.includes("/api/v1/auth/register");

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;

      const { refreshToken } = getStoredTokens();

      if (!refreshToken) {
        runUnauthorizedHandler();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const nextAccessToken = response.data.access_token as string;
        const nextRefreshToken = response.data.refresh_token as string;

        setStoredTokens(nextAccessToken, nextRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        runUnauthorizedHandler();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
