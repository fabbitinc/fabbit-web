import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyInvitation, acceptInvitation } from "@/api/auth";
import { useAuthStore } from "@/stores/authStore";
import { setAuthCookies } from "@/lib/auth-cookies";
import { cn } from "@/lib/utils";
import type { VerifyInvitationResponse } from "@/api/types/auth";

const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN;

type PageStatus = "loading" | "ready" | "submitting" | "error";

// 역할명 한글 매핑
const ROLE_LABELS: Record<string, string> = {
  OWNER: "소유자",
  ADMIN: "관리자",
  MEMBER: "사용자",
  VIEWER: "뷰어",
};

function getRoleLabel(role: string): string {
  return ROLE_LABELS[role.toUpperCase()] ?? role;
}

function buildSubdomainUrl(slug: string, path: string): string {
  const protocol = window.location.protocol;
  return `${protocol}//${slug}.${APP_DOMAIN}${path}`;
}

export function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const [status, setStatus] = useState<PageStatus>("loading");
  const [invitation, setInvitation] = useState<VerifyInvitationResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // 미가입자 폼 상태
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");

  // 초대 토큰 검증
  useEffect(() => {
    if (!token) {
      setErrorMessage("초대 링크가 올바르지 않습니다. 토큰이 누락되었습니다.");
      setStatus("error");
      return;
    }

    let cancelled = false;

    async function verify() {
      try {
        const data = await verifyInvitation(token!);
        if (cancelled) return;
        setInvitation(data);
        setStatus("ready");
      } catch {
        if (cancelled) return;
        setErrorMessage("초대 링크가 만료되었거나 유효하지 않습니다.");
        setStatus("error");
      }
    }

    verify();
    return () => { cancelled = true; };
  }, [token]);

  // 초대 수락 처리
  const handleAccept = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setFormError("");

    if (!invitation || !token) return;

    // 미가입자: 폼 검증
    if (!invitation.is_existing_user) {
      if (!fullName.trim()) {
        setFormError("이름을 입력해 주세요.");
        return;
      }
      if (password.length < 8) {
        setFormError("비밀번호는 8자 이상 입력해 주세요.");
        return;
      }
      if (password !== confirmPassword) {
        setFormError("비밀번호가 일치하지 않습니다.");
        return;
      }
    }

    setStatus("submitting");

    try {
      const result = await acceptInvitation({
        token,
        ...(!invitation.is_existing_user && {
          full_name: fullName.trim(),
          password,
        }),
      });

      const targetSlug = result.organization.slug;
      const targetUrl = buildSubdomainUrl(targetSlug, "/");
      const currentHost = window.location.host;
      const targetHost = `${targetSlug}.${APP_DOMAIN}`;

      if (currentHost === targetHost) {
        // 같은 서브도메인: localStorage에 토큰 저장 후 이동
        localStorage.setItem("accessToken", result.tokens.access_token);
        localStorage.setItem("refreshToken", result.tokens.refresh_token);
        await fetchMe();
        window.location.href = "/";
      } else {
        // 다른 서브도메인: 쿠키로 전달 후 리다이렉트
        setAuthCookies(result.tokens.access_token, result.tokens.refresh_token);
        window.location.href = targetUrl;
      }
    } catch (error) {
      const axiosErr = error as { response?: { data?: { code?: string; message?: string } } };
      const code = axiosErr?.response?.data?.code;
      const serverMessage = axiosErr?.response?.data?.message;

      const ERROR_MESSAGES: Record<string, string> = {
        MEMBER_LIMIT_EXCEEDED: "조직의 멤버 수가 플랜 한도에 도달하여 초대를 수락할 수 없습니다. 조직 관리자에게 문의하세요.",
        INVITATION_EXPIRED: "초대가 만료되었습니다. 새로운 초대를 요청해 주세요.",
        INVITATION_CANCELLED: "초대가 취소되었습니다.",
        ALREADY_MEMBER: "이미 해당 조직의 멤버입니다.",
      };

      const message = (code && ERROR_MESSAGES[code]) || serverMessage || "초대 수락에 실패했습니다.";

      if (code === "MEMBER_LIMIT_EXCEEDED") {
        setErrorMessage(message);
        setStatus("error");
      } else {
        setStatus("ready");
        setFormError(message);
      }
    }
  };

  // 미가입자 폼 유효성 체크
  const canSubmitNewUser =
    fullName.trim().length > 0 &&
    password.length >= 8 &&
    confirmPassword === password;

  return (
    <div className="flex w-full max-w-[1000px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-200/50 md:grid md:grid-cols-2">
      {/* 왼쪽: 브랜딩 */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-10 text-white md:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700" />
        <div className="absolute top-0 left-0 h-full w-full bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full bg-blue-500 blur-3xl opacity-20" />
        <div className="absolute -left-20 -bottom-20 h-[300px] w-[300px] rounded-full bg-indigo-500 blur-3xl opacity-20" />

        <div className="relative z-10">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">Fabbit</span>
          </div>

          <h2 className="mb-4 text-3xl font-bold leading-tight">
            팀에 합류하세요
          </h2>
          <p className="text-blue-100 leading-relaxed opacity-90">
            워크스페이스에 초대되었습니다.<br />
            함께 스마트한 제조 관리를 시작하세요.
          </p>
        </div>
      </div>

      {/* 오른쪽: 콘텐츠 */}
      <div className="flex flex-col justify-center p-8 md:p-12 bg-white">
        {/* 로딩 */}
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-500">초대 정보를 확인하고 있습니다...</p>
          </div>
        )}

        {/* 에러 */}
        {status === "error" && (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">초대를 확인할 수 없습니다</h2>
              <p className="mt-2 text-sm text-gray-500">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* 준비 완료 / 제출 중 */}
        {(status === "ready" || status === "submitting") && invitation && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">초대 수락</h1>
              <p className="mt-2 text-sm text-gray-500">
                아래 조직에 초대되었습니다. 초대를 수락하고 시작하세요.
              </p>
            </div>

            {/* 초대 정보 */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                <span className="text-sm text-gray-500">조직</span>
                <span className="text-sm font-medium text-gray-900">{invitation.org_name}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                <span className="text-sm text-gray-500">초대자</span>
                <span className="text-sm font-medium text-gray-900">{invitation.inviter_name}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                <span className="text-sm text-gray-500">역할</span>
                <span className="text-sm font-medium text-gray-900">{getRoleLabel(invitation.role)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                <span className="text-sm text-gray-500">이메일</span>
                <span className="text-sm font-medium text-gray-900">{invitation.email}</span>
              </div>
            </div>

            {formError && (
              <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                {formError}
              </div>
            )}

            {invitation.is_existing_user ? (
              /* 기가입자: 수락 버튼만 */
              <Button
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/30"
                disabled={status === "submitting"}
                onClick={() => handleAccept()}
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  "초대 수락"
                )}
              </Button>
            ) : (
              /* 미가입자: 이름 + 비밀번호 폼 */
              <form onSubmit={handleAccept} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">이름</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="홍길동"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    disabled={status === "submitting"}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">비밀번호</Label>
                    {password && password.length < 8 && (
                      <span className="text-xs text-red-500">8자 이상 입력해 주세요</span>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="8자 이상 입력하세요"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={cn(
                        "h-11 pr-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                        password && password.length < 8
                          ? "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                          : ""
                      )}
                      disabled={status === "submitting"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">비밀번호 확인</Label>
                    {confirmPassword && confirmPassword !== password && (
                      <span className="text-xs text-red-500">비밀번호가 일치하지 않습니다</span>
                    )}
                    {confirmPassword && password.length >= 8 && confirmPassword === password && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> 일치
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="비밀번호를 다시 입력하세요"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={cn(
                        "h-11 pr-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                        confirmPassword && confirmPassword !== password
                          ? "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                          : confirmPassword && password.length >= 8 && confirmPassword === password
                            ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                            : ""
                      )}
                      disabled={status === "submitting"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/30"
                  disabled={status === "submitting" || !canSubmitNewUser}
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    "가입 및 초대 수락"
                  )}
                </Button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
