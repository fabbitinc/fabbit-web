import { useRef } from "react";
import { Camera, Copy, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, Input, Label, UserAvatar } from "@fabbit/ui";
import { useAuthStore } from "@/features/auth";
import { useDeleteOrganizationProfileImageAction } from "@/features/organization-settings/hooks/use-delete-organization-profile-image-action";
import { useUploadOrganizationProfileImageAction } from "@/features/organization-settings/hooks/use-upload-organization-profile-image-action";
import { getRootDomain } from "@/lib/subdomain";

export function OrganizationGeneralSettingsTab() {
  const organization = useAuthStore((state) => state.currentMembership?.organization);
  const uploadImageAction = useUploadOrganizationProfileImageAction();
  const deleteImageAction = useDeleteOrganizationProfileImageAction();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const workspaceAddress = organization?.slug ? `${organization.slug}.${getRootDomain()}` : "-";

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

  async function handleCopyWorkspaceAddress() {
    if (!organization?.slug) {
      return;
    }

    try {
      if (window.isSecureContext && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(workspaceAddress);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = workspaceAddress;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();

        const copied = document.execCommand("copy");
        document.body.removeChild(textarea);

        if (!copied) {
          throw new Error("copy failed");
        }
      }

      toast.success("워크스페이스 주소를 복사했습니다.");
    } catch {
      toast.error("주소 복사에 실패했습니다.");
    }
  }

  const isUploading = uploadImageAction.isPending || deleteImageAction.isPending;

  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <div>
          <h2 className="text-base font-semibold text-foreground">기본 정보</h2>
          <p className="mt-1 text-sm text-muted-foreground">조직 이름, 슬러그, 프로필 이미지를 확인합니다.</p>
        </div>

        <div className="flex flex-col gap-8 xl:flex-row">
          <div className="flex flex-col items-center gap-3">
            <UserAvatar
              name={organization?.name ?? "?"}
              imageUrl={organization?.profileImageUrl}
              className="h-40 w-40 border border-border/70 bg-muted/35 text-3xl"
              variant="rounded"
            />

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
                <Button
                  disabled={isUploading}
                  size="sm"
                  variant="outline"
                  onClick={() => deleteImageAction.mutate()}
                >
                  {deleteImageAction.isPending ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Trash2 className="mr-1.5 size-3.5" />}
                  제거
                </Button>
              ) : null}
            </div>
          </div>

          <div className="grid min-w-0 flex-1 gap-4">
            <div className="space-y-2">
              <Label>조직명</Label>
              <Input
                className="bg-muted/50"
                disabled
                value={organization?.name ?? "-"}
              />
            </div>
            <div className="space-y-2">
              <Label>워크스페이스 주소</Label>
              <div className="flex items-center gap-2">
                <Input
                  className="bg-muted/50 font-mono"
                  disabled
                  value={workspaceAddress}
                />
                <Button
                  className="shrink-0"
                  disabled={!organization?.slug}
                  size="sm"
                  variant="outline"
                  onClick={handleCopyWorkspaceAddress}
                >
                  <Copy className="size-3.5" />
                  복사
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
