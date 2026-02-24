import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Check, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRegistrationStore } from "@/stores/registrationStore";
import { checkSlug } from "@/api";
import {
  industryOptions,
  teamSizeOptions,
  roleOptions,
} from "@/features/registration/mock-data/registration-mock";
import { cn } from "@/lib/utils";

// 한글 → 영문 slug 변환
function toSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[가-힣]+/g, (match) => {
      const map: Record<string, string> = {
        삼성: "samsung",
        현대: "hyundai",
        엘지: "lg",
        카카오: "kakao",
        네이버: "naver",
        라인: "line",
        쿠팡: "coupang",
        배달의민족: "baemin",
        토스: "toss",
      };
      return map[match] || match;
    })
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// 서브도메인 유효성 검사
const RESERVED_SUBDOMAINS = [
  // 인프라 / 시스템
  "www", "www1", "www2", "web", "site",
  "api", "app", "cdn", "static", "assets", "media",
  "mail", "smtp", "imap", "pop", "mx",
  "ftp", "sftp", "ssh",
  "ns1", "ns2", "ns3", "ns4", "dns",
  "vpn", "proxy", "gateway",
  // 환경
  "dev", "staging", "test", "qa", "uat", "sandbox",
  "prod", "production", "preview", "canary",
  "local", "localhost",
  // 서비스 / 내부 도구
  "admin", "dashboard", "console", "panel",
  "auth", "login", "signup", "register", "sso", "oauth",
  "billing", "payment", "checkout",
  "help", "support", "docs", "wiki", "faq",
  "blog", "news", "press",
  "status", "health", "monitor", "metrics", "grafana",
  // 브랜드 보호
  "fabbit", "fabbitinc", "fabbitapp",
  // 악용 방지
  "abuse", "spam", "phishing", "security",
  "postmaster", "webmaster", "hostmaster",
  "noreply", "no-reply", "mailer-daemon",
  "root", "sysadmin", "administrator",
  // 기타
  "internal", "intranet", "extranet",
  "download", "downloads", "update", "updates",
];

interface SlugValidation {
  valid: boolean;
  error?: string;
}

function validateSubdomain(value: string): SlugValidation {
  if (!value) return { valid: false };
  if (value.length < 2) return { valid: false, error: "2자 이상 입력해 주세요" };
  if (value.length > 63) return { valid: false, error: "63자 이하로 입력해 주세요" };
  if (/^-|-$/.test(value)) return { valid: false, error: "하이픈(-)으로 시작하거나 끝날 수 없습니다" };
  if (/--/.test(value)) return { valid: false, error: "하이픈(-)을 연속으로 사용할 수 없습니다" };
  if (!/^[a-z0-9-]+$/.test(value)) return { valid: false, error: "영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다" };
  if (/^\d+$/.test(value)) return { valid: false, error: "숫자로만 구성할 수 없습니다" };
  if (RESERVED_SUBDOMAINS.includes(value)) return { valid: false, error: "사용할 수 없는 주소입니다" };
  return { valid: true };
}

type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export function WorkspaceSetupPage() {
  const navigate = useNavigate();
  const { workspaceData, setWorkspaceData } = useRegistrationStore();
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [slugError, setSlugError] = useState<string>();
  const [slugTouched, setSlugTouched] = useState(false);
  const [isCustomIndustry, setIsCustomIndustry] = useState(false);
  const [isCustomRole, setIsCustomRole] = useState(false);
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef(false);

  const validateAndCheck = useCallback((slug: string) => {
    setSlugError(undefined);
    abortRef.current = true;

    // 이전 API 체크 취소
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    if (!slug) {
      setSlugStatus("idle");
      return;
    }

    // 1단계: 로컬 검증 (형식 + 예약어)
    const validation = validateSubdomain(slug);
    if (!validation.valid) {
      setSlugStatus("invalid");
      setSlugError(validation.error);
      return;
    }

    // 2단계: API 중복 체크
    setSlugStatus("checking");
    abortRef.current = false;
    checkTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await checkSlug(slug);
        if (abortRef.current) return;

        if (result.available) {
          setSlugStatus("available");
        } else {
          setSlugStatus("taken");
          setSlugError(result.message ?? "이미 사용 중인 주소입니다");
        }
      } catch {
        if (abortRef.current) return;
        setSlugStatus("taken");
        setSlugError("주소 확인에 실패했습니다");
      }
    }, 500);
  }, []);

  const handleOrgNameChange = (value: string) => {
    setWorkspaceData({ organizationName: value });

    if (!slugTouched) {
      const suggested = toSlug(value);
      setWorkspaceData({ slug: suggested });
      validateAndCheck(suggested);
    }
  };

  const handleSlugChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlugTouched(true);
    setWorkspaceData({ slug: cleaned });
    validateAndCheck(cleaned);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!workspaceData.organizationName.trim() || !workspaceData.slug.trim()) return;
    if (slugStatus !== "available") return;

    navigate("/plan");
  };

  const isFormValid =
    workspaceData.organizationName.trim() &&
    workspaceData.slug.trim() &&
    slugStatus === "available";

  return (
    <div className="flex w-full max-w-[1000px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-200/50 md:grid md:grid-cols-2">
      {/* Left Column: Branding */}
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
            팀의 공간을<br />
            만들어보세요.
          </h2>
          <p className="text-blue-100 leading-relaxed opacity-90">
            워크스페이스는 팀의 모든 활동이 이루어지는<br />
            공간입니다. 조직에 맞게 설정하세요.
          </p>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="flex flex-col justify-center p-8 md:p-12 bg-white">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">워크스페이스 설정</h1>
          <p className="mt-2 text-sm text-gray-500">
            조직 정보를 입력해 주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 조직명 */}
          <div className="space-y-1.5">
            <Label htmlFor="orgName" className="text-sm font-medium text-gray-700">
              조직명
            </Label>
            <Input
              id="orgName"
              type="text"
              placeholder="회사명 또는 팀명을 입력하세요"
              value={workspaceData.organizationName}
              onChange={(e) => handleOrgNameChange(e.target.value)}
              className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
          </div>

          {/* 워크스페이스 주소 (slug) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="slug" className="text-sm font-medium text-gray-700">
                워크스페이스 주소
              </Label>
              {slugError && (
                <span className="text-xs text-red-500">{slugError}</span>
              )}
              {slugStatus === "available" && (
                <span className="text-xs text-green-600">사용 가능</span>
              )}
            </div>
            <div
              className={cn(
                "flex items-center h-11 rounded-md border bg-gray-50 transition-all focus-within:bg-white focus-within:ring-[3px]",
                slugStatus === "available" && "border-green-500 focus-within:border-green-500 focus-within:ring-green-500/20",
                (slugStatus === "taken" || slugStatus === "invalid") && "border-red-300 focus-within:border-red-400 focus-within:ring-red-400/20",
                slugStatus !== "available" && slugStatus !== "taken" && slugStatus !== "invalid" && "border-gray-200 focus-within:border-blue-500 focus-within:ring-blue-500/20",
              )}
            >
              <input
                id="slug"
                type="text"
                placeholder="my-workspace"
                value={workspaceData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="flex-1 h-full px-3 bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
              <div className="flex items-center gap-2 pr-3 text-sm text-gray-400 whitespace-nowrap select-none border-l border-gray-200 pl-3 h-full bg-gray-100 rounded-r-md">
                .fabbit.app
                {slugStatus === "checking" && (
                  <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                )}
                {slugStatus === "available" && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
                {(slugStatus === "taken" || slugStatus === "invalid") && (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </div>

          {/* 산업 분야 */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">산업 분야</Label>
            {isCustomIndustry ? (
              <div className="relative">
                <Input
                  type="text"
                  placeholder="산업 분야를 입력하세요"
                  value={workspaceData.industry}
                  onChange={(e) => setWorkspaceData({ industry: e.target.value })}
                  className="h-11 pr-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                      autoFocus
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => {
                    setIsCustomIndustry(false);
                    setWorkspaceData({ industry: "" });
                  }}
                  title="목록에서 선택"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Select
                value={workspaceData.industry}
                onValueChange={(value) => {
                  if (value === "custom") {
                    setIsCustomIndustry(true);
                    setWorkspaceData({ industry: "" });
                  } else {
                    setWorkspaceData({ industry: value });
                  }
                }}
                >
                <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors">
                  <SelectValue placeholder="산업 분야를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {industryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* 팀 규모 */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">팀 규모</Label>
            <div className="grid grid-cols-4 gap-2">
              {teamSizeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setWorkspaceData({ teamSize: option.value })}
                      className={cn(
                    "h-10 rounded-lg border text-sm font-medium transition-all",
                    workspaceData.teamSize === option.value
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 직무 */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">직무</Label>
            {isCustomRole ? (
              <div className="relative">
                <Input
                  type="text"
                  placeholder="직무를 입력하세요"
                  value={workspaceData.role}
                  onChange={(e) => setWorkspaceData({ role: e.target.value })}
                  className="h-11 pr-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                      autoFocus
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => {
                    setIsCustomRole(false);
                    setWorkspaceData({ role: "" });
                  }}
                  title="목록에서 선택"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Select
                value={workspaceData.role}
                onValueChange={(value) => {
                  if (value === "custom") {
                    setIsCustomRole(true);
                    setWorkspaceData({ role: "" });
                  } else {
                    setWorkspaceData({ role: value });
                  }
                }}
                >
                <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors">
                  <SelectValue placeholder="직무를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              className="h-12 px-8 text-base font-semibold border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
              onClick={() => navigate("/signup")}
            >
              이전
            </Button>
            <Button
              type="submit"
              className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/30"
              disabled={!isFormValid}
            >
              다음
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
