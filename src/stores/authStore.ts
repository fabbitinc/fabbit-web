import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginUser, logout as logoutApi, queryClient } from "@/api";

interface Organization {
  id: string;
  name: string;
  logo?: string;
  role: "owner" | "admin" | "member";
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "admin" | "manager" | "member";
  organizationId: string;
  organizationName: string;
}

interface AuthState {
  user: User | null;
  organizations: Organization[];
  currentOrganization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: "google" | "naver" | "kakao") => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  switchOrganization: (organizationId: string) => void;
}

// Mock organization data
const mockOrganizations: Organization[] = [
  { id: "org-1", name: "Fabbit Demo", role: "owner" },
  { id: "org-2", name: "삼성전자", logo: "S", role: "admin" },
  { id: "org-3", name: "현대자동차", logo: "H", role: "member" },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      organizations: mockOrganizations,
      currentOrganization: mockOrganizations[0],
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        try {
          const response = await loginUser({ email, password });

          // 토큰 저장
          localStorage.setItem("accessToken", response.accessToken);
          localStorage.setItem("refreshToken", response.refreshToken);

          // TODO: API에서 user 정보를 반환하지 않음
          // 임시로 email에서 추출하여 사용
          const mockUser: User = {
            id: "user-1",
            email: email,
            name: email.split("@")[0],
            role: "admin",
            organizationId: "org-1",
            organizationName: "Fabbit Demo",
          };

          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            organizations: mockOrganizations,
            currentOrganization: mockOrganizations[0],
          });
        } catch (error) {
          set({ isLoading: false });
          throw error instanceof Error ? error : new Error("로그인에 실패했습니다.");
        }
      },

      loginWithProvider: async (provider) => {
        set({ isLoading: true });

        // Mock OAuth login - 실제로는 OAuth 플로우 시작
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const providerNames = {
          google: "Google",
          naver: "Naver",
          kakao: "Kakao",
        };

        const mockUser: User = {
          id: `user-${provider}-1`,
          email: `user@${provider}.com`,
          name: `${providerNames[provider]} User`,
          role: "member",
          organizationId: "org-1",
          organizationName: "Fabbit Demo",
        };

        set({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          organizations: mockOrganizations,
          currentOrganization: mockOrganizations[0],
        });
      },

      logout: async () => {
        const refreshToken = localStorage.getItem("refreshToken");

        try {
          if (refreshToken) {
            await logoutApi({ refreshToken });
          }
        } finally {
          // 서버 응답 상관없이 로컬 정리
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");

          // React Query 캐시 초기화
          queryClient.clear();

          // 상태 초기화
          set({
            user: null,
            isAuthenticated: false,
            currentOrganization: null,
            organizations: [],
          });
        }
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      switchOrganization: (organizationId: string) => {
        const { organizations, user } = get();
        const organization = organizations.find((o) => o.id === organizationId);
        if (organization && user) {
          set({
            currentOrganization: organization,
            user: {
              ...user,
              organizationId: organization.id,
              organizationName: organization.name,
              role: organization.role === "owner" ? "admin" : organization.role === "admin" ? "manager" : "member",
            },
          });
        }
      },
    }),
    {
      name: "fabbit-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        currentOrganization: state.currentOrganization,
      }),
    }
  )
);
