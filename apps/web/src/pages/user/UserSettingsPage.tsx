import { useState, useRef, useCallback, type ComponentType } from "react";
import { useSearchParams } from "react-router-dom";
import { User, Shield, Bell, Palette, Camera, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/components/UserAvatar";
import { useAuthStore } from "@/stores/authStore";
import {
  updateProfile,
  setProfileImage as setProfileImageApi,
  deleteProfileImage as deleteProfileImageApi,
  createUpload,
  uploadFileToUrl,
  completeUpload,
} from "@/api";

type UserSettingsTab = "profile" | "security" | "notifications" | "preferences";

const VALID_MENUS = new Set<string>(["profile", "security", "notifications", "preferences"]);

const tabs: Array<{
  id: UserSettingsTab;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { id: "profile", label: "프로필", icon: User },
  { id: "security", label: "보안", icon: Shield },
  { id: "notifications", label: "알림", icon: Bell },
  { id: "preferences", label: "개인화", icon: Palette },
];

export function UserSettingsPage() {
  const user = useAuthStore((state) => state.user);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const [searchParams, setSearchParams] = useSearchParams();

  const menuParam = searchParams.get("menu");
  const activeTab: UserSettingsTab = menuParam && VALID_MENUS.has(menuParam) ? (menuParam as UserSettingsTab) : "profile";

  const setActiveTab = useCallback((tab: UserSettingsTab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === "profile") {
        next.delete("menu");
      } else {
        next.set("menu", tab);
      }
      return next;
    });
  }, [setSearchParams]);

  const [name, setName] = useState(user?.name ?? "");
  const email = user?.email ?? "";
  const [phone, setPhone] = useState(user?.phone ?? "");

  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(
    user?.profileImageUrl ?? null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // 프로필 이미지 업로드 (파일 업로드 → 프로필 이미지 설정 → /me 갱신)
  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("이미지 파일만 업로드할 수 있습니다.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("파일 크기는 5MB 이하만 가능합니다.");
        return;
      }

      setIsUploadingImage(true);
      try {
        // 1. presigned URL 발급
        const upload = await createUpload({
          original_name: file.name,
          content_type: file.type,
          file_size: file.size,
        });

        // 2. S3 업로드
        await uploadFileToUrl(upload.upload_url, file);

        // 3. 업로드 완료 처리
        await completeUpload(upload.file_id);

        // 4. 프로필 이미지 설정
        const result = await setProfileImageApi({ file_id: upload.file_id });
        setProfileImageUrl(result.profile_image_url);

        // 5. authStore 갱신
        await fetchMe();
        toast.success("프로필 이미지를 변경했습니다.");
      } catch {
        toast.error("이미지 업로드에 실패했습니다.");
      } finally {
        setIsUploadingImage(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [fetchMe],
  );

  // 프로필 이미지 제거
  const handleImageRemove = useCallback(async () => {
    setIsUploadingImage(true);
    try {
      await deleteProfileImageApi();
      setProfileImageUrl(null);
      await fetchMe();
      toast.success("프로필 이미지를 제거했습니다.");
    } catch {
      toast.error("프로필 이미지 제거에 실패했습니다.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [fetchMe]);

  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [loginAlertEnabled, setLoginAlertEnabled] = useState(true);
  const [sessionProtection, setSessionProtection] = useState(true);

  const [emailNotification, setEmailNotification] = useState(true);
  const [mentionNotification, setMentionNotification] = useState(true);
  const [digestNotification, setDigestNotification] = useState(false);

  const [compactMode, setCompactMode] = useState(false);
  const [autoSaveDraft, setAutoSaveDraft] = useState(true);

  // 프로필 저장 (이름, 연락처)
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        full_name: name || null,
        phone: phone || null,
      });
      await fetchMe();
      toast.success("프로필을 저장했습니다.");
    } catch {
      toast.error("프로필 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }, [name, phone, fetchMe]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-foreground">사용자 설정</h1>
        <p className="text-sm text-muted-foreground">
          내 계정 정보와 알림/보안 설정을 관리합니다.
        </p>
      </div>

      <div className="flex gap-0 rounded-lg border border-border bg-card">
        <aside className="w-56 border-r border-border bg-muted/30 p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                  activeTab === tab.id
                    ? "bg-background font-medium text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="flex-1 overflow-auto p-6">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  기본 프로필
                </h2>
                <div className="mt-4 flex gap-8">
                  {/* 프로필 이미지 */}
                  <div className="flex flex-col items-center gap-3">
                    <Avatar key={profileImageUrl ?? "fallback"} className="h-42 w-42 rounded-xl">
                      {profileImageUrl ? (
                        <AvatarImage
                          src={profileImageUrl}
                          alt="프로필 이미지"
                          className="rounded-xl"
                        />
                      ) : null}
                      <AvatarFallback className="rounded-xl text-3xl font-medium text-muted-foreground">
                        {getInitials(name)}
                      </AvatarFallback>
                    </Avatar>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {isUploadingImage ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Camera className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        {profileImageUrl ? "변경" : "업로드"}
                      </Button>
                      {profileImageUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isUploadingImage}
                          onClick={handleImageRemove}
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          제거
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 프로필 정보 */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="profile-name">이름</Label>
                      <Input
                        id="profile-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-email">이메일</Label>
                      <Input
                        id="profile-email"
                        value={email}
                        disabled
                        className="bg-muted/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-phone">연락처</Label>
                      <Input
                        id="profile-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="010-0000-0000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  )}
                  저장
                </Button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-foreground">
                로그인 보안
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      2단계 인증
                    </p>
                    <p className="text-xs text-muted-foreground">
                      OTP 또는 인증 앱으로 추가 인증을 수행합니다.
                    </p>
                  </div>
                  <Switch
                    checked={mfaEnabled}
                    onCheckedChange={setMfaEnabled}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      새 기기 로그인 알림
                    </p>
                    <p className="text-xs text-muted-foreground">
                      신규 브라우저 로그인 시 메일 알림을 전송합니다.
                    </p>
                  </div>
                  <Switch
                    checked={loginAlertEnabled}
                    onCheckedChange={setLoginAlertEnabled}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      세션 보호 강화
                    </p>
                    <p className="text-xs text-muted-foreground">
                      민감 작업 전에 재인증을 요구합니다.
                    </p>
                  </div>
                  <Switch
                    checked={sessionProtection}
                    onCheckedChange={setSessionProtection}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-foreground">
                알림 채널
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      이메일 알림
                    </p>
                    <p className="text-xs text-muted-foreground">
                      중요 공지, 보안 이벤트 메일 수신
                    </p>
                  </div>
                  <Switch
                    checked={emailNotification}
                    onCheckedChange={setEmailNotification}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      멘션 알림
                    </p>
                    <p className="text-xs text-muted-foreground">
                      댓글/작업에서 @멘션된 경우 즉시 알림
                    </p>
                  </div>
                  <Switch
                    checked={mentionNotification}
                    onCheckedChange={setMentionNotification}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      일일 요약 리포트
                    </p>
                    <p className="text-xs text-muted-foreground">
                      하루 활동 요약을 오전 9시에 수신
                    </p>
                  </div>
                  <Switch
                    checked={digestNotification}
                    onCheckedChange={setDigestNotification}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-foreground">
                사용 환경
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      컴팩트 모드
                    </p>
                    <p className="text-xs text-muted-foreground">
                      리스트/테이블 행 간격을 줄여 표시합니다.
                    </p>
                  </div>
                  <Switch
                    checked={compactMode}
                    onCheckedChange={setCompactMode}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      작성 중 자동 저장
                    </p>
                    <p className="text-xs text-muted-foreground">
                      폼 입력 중 임시 저장을 자동으로 수행합니다.
                    </p>
                  </div>
                  <Switch
                    checked={autoSaveDraft}
                    onCheckedChange={setAutoSaveDraft}
                  />
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
