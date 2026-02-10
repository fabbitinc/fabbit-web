import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Loader2, Check, X, Globe } from "lucide-react";
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
import { useOnboardingStore } from "@/stores/onboardingStore";
import {
  industryOptions,
  teamSizeOptions,
  roleOptions,
} from "@/features/onboarding/mock-data/onboarding-mock";
import { cn } from "@/lib/utils";

// 한글 → 영문 slug 변환
function toSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[가-힣]+/g, (match) => {
      // 간단한 한글→영문 매핑 (실제로는 서버 API 호출)
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

// Mock 중복 체크 (사용 중인 slug 목록)
const takenSlugs = ["samsung", "hyundai", "fabbit"];

type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export function WorkspaceSetupPage() {
  const navigate = useNavigate();
  const { setStep, workspaceData, setWorkspaceData } = useOnboardingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [slugError, setSlugError] = useState<string>();
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    setStep(2);
  }, [setStep]);

  // 서브도메인 유효성 + 중복 체크
  const validateAndCheck = useCallback((slug: string) => {
    setSlugError(undefined);

    if (!slug) {
      setSlugStatus("idle");
      return;
    }

    const validation = validateSubdomain(slug);
    if (!validation.valid) {
      setSlugStatus("invalid");
      setSlugError(validation.error);
      return;
    }

    // 유효성 통과 → 중복 체크
    setSlugStatus("checking");
    setTimeout(() => {
      if (takenSlugs.includes(slug)) {
        setSlugStatus("taken");
        setSlugError("이미 사용 중인 주소입니다");
      } else {
        setSlugStatus("available");
      }
    }, 500);
  }, []);

  // 조직명 변경 시 slug 자동 추천
  const handleOrgNameChange = (value: string) => {
    setWorkspaceData({ organizationName: value });

    if (!slugTouched) {
      const suggested = toSlug(value);
      setWorkspaceData({ slug: suggested });
      validateAndCheck(suggested);
    }
  };

  // slug 직접 변경
  const handleSlugChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlugTouched(true);
    setWorkspaceData({ slug: cleaned });
    validateAndCheck(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workspaceData.organizationName.trim() || !workspaceData.slug.trim()) return;
    if (slugStatus !== "available") return;

    setIsSubmitting(true);

    // mock 시뮬레이션
    setTimeout(() => {
      setIsSubmitting(false);
      navigate("/onboarding/plan");
    }, 1000);
  };

  const isFormValid =
    workspaceData.organizationName.trim() &&
    workspaceData.slug.trim() &&
    slugStatus === "available";

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* 상단 헤더 */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6]">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#0f172a]">워크스페이스 설정</h1>
          <p className="text-sm text-[#64748b]">조직 정보를 입력해 주세요</p>
        </div>

        {/* 카드 */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 조직명 */}
            <div className="space-y-2">
              <Label htmlFor="orgName" className="text-[#334155]">
                조직명 <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94a3b8]" />
                <Input
                  id="orgName"
                  type="text"
                  placeholder="회사명 또는 팀명을 입력하세요"
                  value={workspaceData.organizationName}
                  onChange={(e) => handleOrgNameChange(e.target.value)}
                  className="pl-10 h-12 bg-white border-[#e2e8f0]"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* 워크스페이스 주소 (slug) */}
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-[#334155]">
                워크스페이스 주소 <span className="text-red-500">*</span>
              </Label>
              <div
                className={cn(
                  "flex items-center h-12 rounded-md border bg-white transition-[color,box-shadow] focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
                  slugStatus === "available" && "border-[#22c55e] focus-within:border-[#22c55e] focus-within:ring-[#22c55e]/20",
                  (slugStatus === "taken" || slugStatus === "invalid") && "border-red-400 focus-within:border-red-400 focus-within:ring-red-400/20",
                  slugStatus !== "available" && slugStatus !== "taken" && slugStatus !== "invalid" && "border-[#e2e8f0]",
                )}
              >
                <Globe className="ml-3 h-5 w-5 text-[#94a3b8] shrink-0" />
                <input
                  id="slug"
                  type="text"
                  placeholder="my-workspace"
                  value={workspaceData.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="flex-1 h-full px-2 bg-transparent text-sm outline-none placeholder:text-[#94a3b8]"
                  disabled={isSubmitting}
                />
                <div className="flex items-center gap-2 pr-3 text-sm text-[#94a3b8] whitespace-nowrap select-none border-l border-[#e2e8f0] pl-3 h-full bg-[#f8fafc] rounded-r-md">
                  .fabbitinc.com
                  {slugStatus === "checking" && (
                    <Loader2 className="h-4 w-4 text-[#94a3b8] animate-spin" />
                  )}
                  {slugStatus === "available" && (
                    <Check className="h-4 w-4 text-[#22c55e]" />
                  )}
                  {(slugStatus === "taken" || slugStatus === "invalid") && (
                    <X className="h-4 w-4 text-red-400" />
                  )}
                </div>
              </div>
              {slugError && (
                <p className="text-xs text-red-400">{slugError}</p>
              )}
            </div>

            {/* 산업 분야 */}
            <div className="space-y-2">
              <Label className="text-[#334155]">산업 분야</Label>
              <Select
                value={workspaceData.industry}
                onValueChange={(value) => setWorkspaceData({ industry: value })}
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-12 bg-white border-[#e2e8f0]">
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
            </div>

            {/* 팀 규모 */}
            <div className="space-y-2">
              <Label className="text-[#334155]">팀 규모</Label>
              <div className="grid grid-cols-4 gap-2">
                {teamSizeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setWorkspaceData({ teamSize: option.value })}
                    disabled={isSubmitting}
                    className={cn(
                      "h-10 rounded-lg border text-sm font-medium transition-colors",
                      workspaceData.teamSize === option.value
                        ? "bg-[#3b82f6] text-white border-[#3b82f6]"
                        : "bg-white text-[#334155] border-[#e2e8f0] hover:border-[#3b82f6] hover:text-[#3b82f6]",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 직무 */}
            <div className="space-y-2">
              <Label className="text-[#334155]">직무</Label>
              <Select
                value={workspaceData.role}
                onValueChange={(value) => setWorkspaceData({ role: value })}
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-12 bg-white border-[#e2e8f0]">
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
            </div>

            {/* 다음 버튼 */}
            <Button
              type="submit"
              className="w-full h-12 bg-[#3b82f6] hover:bg-[#2563eb] text-base font-medium"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  설정 중...
                </>
              ) : (
                "다음"
              )}
            </Button>
          </form>
        </div>
    </div>
  );
}
