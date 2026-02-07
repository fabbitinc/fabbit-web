import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const isDev = import.meta.env.DEV;

// 인증 정보 초기화 및 로그인 페이지로 이동
function clearAuthAndRedirect() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  // zustand persist 상태도 초기화
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    currentOrganization: null,
    organizations: [],
  });
  window.location.href = "/login";
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터: 인증 토큰 추가 + 개발 로깅
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 개발 환경에서만 요청 로깅
    if (isDev) {
      console.log(
        `🚀 [API] ${config.method?.toUpperCase()} ${config.url}`,
        config.data ?? "",
      );
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// 응답 인터셉터: 개발 로깅 + 토큰 만료 처리
apiClient.interceptors.response.use(
  (response) => {
    // 개발 환경에서만 응답 로깅
    if (isDev) {
      console.log(
        `✅ [API] ${response.config.method?.toUpperCase()} ${response.config.url}`,
        response.data,
      );
    }
    return response;
  },
  async (error) => {
    // 개발 환경에서만 에러 로깅
    if (isDev) {
      console.error(
        `❌ [API] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.response?.status,
        error.response?.data ?? error.message,
      );
    }

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          if (isDev) {
            console.log("🔄 [API] Refreshing token...");
          }
          const response = await axios.post(
            `${API_BASE_URL}/api/v1/auth/refresh`,
            {
              refreshToken,
            },
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          if (isDev) {
            console.log("✅ [API] Token refreshed successfully");
          }

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } catch {
          if (isDev) {
            console.log("❌ [API] Token refresh failed, redirecting to login");
          }
          clearAuthAndRedirect();
          return Promise.reject(error);
        }
      } else {
        // refreshToken이 없으면 바로 로그인 페이지로 이동
        if (isDev) {
          console.log("❌ [API] No refresh token, redirecting to login");
        }
        clearAuthAndRedirect();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
