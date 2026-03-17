import { useRef } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage, Button, Input, Label, Switch } from "@fabbit/ui";
import { useAuthStore } from "@/features/auth";
import { useDeleteOrganizationProfileImageAction } from "@/features/organization-settings/hooks/use-delete-organization-profile-image-action";
import { useUploadOrganizationProfileImageAction } from "@/features/organization-settings/hooks/use-upload-organization-profile-image-action";
import { useOrganizationSettingsStore } from "@/features/organization-settings/stores/organization-settings-store";

export function OrganizationGeneralSettingsTab() {
  const organization = useAuthStore((state) => state.currentMembership?.organization);
  const general = useOrganizationSettingsStore((state) => state.general);
  const setGeneral = useOrganizationSettingsStore((state) => state.setGeneral);
  const uploadImageAction = useUploadOrganizationProfileImageAction();
  const deleteImageAction = useDeleteOrganizationProfileImageAction();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    uploadImageAction.mutate(file, {
      onSettled: () => {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
    });
  }

  const isUploading = uploadImageAction.isPending || deleteImageAction.isPending;

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">기본 정보</h2>
            <p className="mt-1 text-sm text-muted-foreground">조직 이름, 슬러그, 프로필 이미지를 확인합니다.</p>
          </div>
        </div>

        <div className="flex flex-col gap-8 rounded-lg border border-border/70 bg-card p-4 xl:flex-row">
          <div className="flex flex-col items-center gap-3">
            <Avatar className="h-40 w-40 rounded-lg border border-border/70 bg-muted/35">
              {organization?.profileImageUrl ? (
                <AvatarImage alt="조직 프로필 이미지" className="rounded-lg" src={organization.profileImageUrl} />
              ) : null}
              <AvatarFallback className="rounded-lg text-3xl font-medium text-muted-foreground">
                {organization?.name?.charAt(0) ?? "?"}
              </AvatarFallback>
            </Avatar>

            <input
              ref={fileInputRef}
              accept="image/*"
              aria-label="조직 프로필 이미지 업로드"
              className="hidden"
              type="file"
              onChange={handleFileChange}
            />

            <div className="flex gap-2">
              <Button disabled={isUploading} size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                {uploadImageAction.isPending ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Camera className="mr-1.5 size-3.5" />}
                {organization?.profileImageUrl ? "변경" : "업로드"}
              </Button>
              {organization?.profileImageUrl ? (
                <Button disabled={isUploading} size="sm" variant="outline" onClick={() => deleteImageAction.mutate()}>
                  {deleteImageAction.isPending ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Trash2 className="mr-1.5 size-3.5" />}
                  제거
                </Button>
              ) : null}
            </div>
          </div>

          <div className="grid min-w-0 flex-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="org-settings-name">조직명</Label>
              <Input id="org-settings-name" disabled value={organization?.name ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-settings-slug">워크스페이스 슬러그</Label>
              <Input id="org-settings-slug" disabled value={organization?.slug ?? ""} />
            </div>
            <p className="text-xs text-muted-foreground">조직명과 슬러그 수정 API는 아직 제공되지 않아 현재는 읽기 전용입니다.</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">초대 정책</h2>
            <p className="mt-1 text-sm text-muted-foreground">백엔드 계약이 준비되기 전까지 브라우저 로컬 정책으로 저장합니다.</p>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">외부 도메인 사용자 초대 허용</p>
              <p className="text-xs text-muted-foreground">승인된 조직 도메인 외 사용자의 초대를 허용합니다.</p>
            </div>
            <Switch
              checked={general.allowOutsideInvite}
              onCheckedChange={(checked) => setGeneral({ allowOutsideInvite: checked })}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">사용자 초대 승인 필수</p>
              <p className="text-xs text-muted-foreground">관리자 승인 후에만 초대가 최종 확정됩니다.</p>
            </div>
            <Switch
              checked={general.approvalRequired}
              onCheckedChange={(checked) => setGeneral({ approvalRequired: checked })}
            />
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => toast.success("초대 정책을 브라우저 설정으로 저장했습니다.")}
            >
              저장
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
