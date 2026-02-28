import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  login as loginApi,
  logout as logoutApi,
  register as registerApi,
  getMe,
  queryClient,
} from "@/api";
import { getSubdomain } from "@/lib/subdomain";
import type { PlanTier } from "@/features/registration/types/registration.types";
import type {
  RegisterRequest,
  MembershipResponse,
} from "@/api/types/auth";

interface User {
  id: string;
  email: string;
  name: string;
}

interface Organization {
  id: string;
  slug: string;
  name: string;
  planType: string;
}

interface Membership {
  orgId: string;
  role: string;
  organization: Organization;
}

export interface AuthResult {
  isAdmin: boolean;
}

export interface RegisterResult extends AuthResult {
  slug: string;
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  memberships: Membership[];
  currentMembership: Membership | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  selectedPlan: PlanTier;

  // Actions
  login: (email: string, password: string) => Promise<AuthResult>;
  loginWithProvider: (provider: "google" | "naver" | "kakao") => Promise<void>;
  register: (data: RegisterRequest) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setUser: (user: User | null) => void;
}

function mapMembership(m: MembershipResponse): Membership {
  return {
    orgId: m.org_id,
    role: m.role,
    organization: {
      id: m.organization.id,
      slug: m.organization.slug,
      name: m.organization.name,
      planType: m.organization.plan_type,
    },
  };
}

function storeTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}

function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

function isAdminRole(role: string | undefined): boolean {
  const upper = role?.toUpperCase();
  return upper === "ADMIN" || upper === "OWNER";
}

// 현재 서브도메인에 매칭되는 멤버십을 우선 선택, 없으면 첫 번째
function findCurrentMembership(memberships: Membership[]): Membership | null {
  const subdomain = getSubdomain();
  if (subdomain) {
    const match = memberships.find((m) => m.organization.slug === subdomain);
    if (match) return match;
  }
  return memberships[0] ?? null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      memberships: [],
      currentMembership: null,
      isAuthenticated: false,
      isLoading: false,
      selectedPlan: "starter",

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        try {
          const response = await loginApi({ email, password });

          storeTokens(response.tokens.access_token, response.tokens.refresh_token);

          const meResponse = await getMe();
          const memberships = meResponse.memberships.map(mapMembership);
          const current = findCurrentMembership(memberships);
          const isAdmin = isAdminRole(current?.role);

          set({
            user: {
              id: meResponse.user.id,
              email: meResponse.user.email,
              name: meResponse.user.full_name,
            },
            memberships,
            currentMembership: current,
            isAuthenticated: true,
            isLoading: false,
            selectedPlan: (current?.organization.planType?.toLowerCase() as PlanTier) ?? "starter",
          });

          return { isAdmin };
        } catch (error) {
          set({ isLoading: false });
          throw error instanceof Error ? error : new Error("로그인에 실패했습니다.");
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true });

        try {
          // 1. 회원가입
          const regResponse = await registerApi(data);

          // 2. 토큰 저장 (현재 origin의 localStorage)
          storeTokens(regResponse.tokens.access_token, regResponse.tokens.refresh_token);

          // 3. /me 호출로 멤버십 정보 조회
          const meResponse = await getMe();
          const memberships = meResponse.memberships.map(mapMembership);
          const current = findCurrentMembership(memberships);
          const isAdmin = isAdminRole(current?.role);

          // isAuthenticated를 설정하지 않음 — route guard가 동작하지 않도록
          // 서브도메인 리다이렉트 후 fetchMe()로 인증 상태를 복원
          set({ isLoading: false });

          return {
            isAdmin,
            slug: current?.organization.slug ?? "",
            accessToken: regResponse.tokens.access_token,
            refreshToken: regResponse.tokens.refresh_token,
          };
        } catch (error) {
          set({ isLoading: false });
          throw error instanceof Error ? error : new Error("회원가입에 실패했습니다.");
        }
      },

      loginWithProvider: async (provider) => {
        void provider;
        // TODO: OAuth 플로우 구현
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        set({ isLoading: false });
        throw new Error("소셜 로그인은 준비 중입니다.");
      },

      logout: async () => {
        const refreshToken = localStorage.getItem("refreshToken");

        try {
          if (refreshToken) {
            await logoutApi(refreshToken);
          }
        } finally {
          clearTokens();
          queryClient.clear();

          set({
            user: null,
            memberships: [],
            currentMembership: null,
            isAuthenticated: false,
          });
        }
      },

      fetchMe: async () => {
        try {
          const meResponse = await getMe();
          const memberships = meResponse.memberships.map(mapMembership);
          const current = findCurrentMembership(memberships);

          set({
            user: {
              id: meResponse.user.id,
              email: meResponse.user.email,
              name: meResponse.user.full_name,
            },
            memberships,
            currentMembership: current,
            isAuthenticated: true,
            selectedPlan: (current?.organization.planType?.toLowerCase() as PlanTier) ?? "starter",
          });
        } catch {
          // /me 실패 시 로그아웃 처리
          clearTokens();
          set({
            user: null,
            memberships: [],
            currentMembership: null,
            isAuthenticated: false,
          });
        }
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: "fabbit-auth",
      partialize: (state) => ({
        user: state.user,
        memberships: state.memberships,
        currentMembership: state.currentMembership,
        isAuthenticated: state.isAuthenticated,
        selectedPlan: state.selectedPlan,
      }),
    }
  )
);
