import { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage, Button, Input, Label } from "@fabbit/ui";
import { useAuthStore, type UserModel } from "@/features/auth";
import { useDeleteUserProfileImageAction } from "@/features/user-settings/hooks/use-delete-user-profile-image-action";
import { useUpdateUserProfileAction } from "@/features/user-settings/hooks/use-update-user-profile-action";
import { useUploadUserProfileImageAction } from "@/features/user-settings/hooks/use-upload-user-profile-image-action";

export function UserProfileSettingsTab() {
  const user = useAuthStore((state) => state.user);
  const formKey = `${user?.id ?? "anonymous"}:${user?.name ?? ""}:${user?.phone ?? ""}:${user?.profileImageUrl ?? ""}`;

  return <UserProfileSettingsForm key={formKey} user={user} />;
}

interface UserProfileSettingsFormProps {
  user: UserModel | null;
}

function UserProfileSettingsForm({ user }: UserProfileSettingsFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateProfileAction = useUpdateUserProfileAction();
  const uploadProfileImageAction = useUploadUserProfileImageAction();
  const deleteProfileImageAction = useDeleteUserProfileImageAction();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    uploadProfileImageAction.mutate(file, {
      onSettled: () => {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
    });
  }

  const isUploading = uploadProfileImageAction.isPending || deleteProfileImageAction.isPending;
  const isDirty = name !== (user?.name ?? "") || phone !== (user?.phone ?? "");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">기본 프로필</h2>
        <p className="mt-1 text-sm text-muted-foreground">이름, 연락처, 프로필 이미지를 관리합니다.</p>
      </div>

      <div className="flex flex-col gap-8 xl:flex-row">
        <div className="flex flex-col items-center gap-3">
          <Avatar className="h-40 w-40 rounded-lg border border-border/70 bg-muted/35">
            {user?.profileImageUrl ? <AvatarImage alt="프로필 이미지" className="rounded-lg" src={user.profileImageUrl} /> : null}
            <AvatarFallback className="rounded-lg text-3xl font-medium text-muted-foreground">
              {name.trim().charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>

          <input
            ref={fileInputRef}
            accept="image/*"
            aria-label="프로필 이미지 업로드"
            className="hidden"
            type="file"
            onChange={handleFileChange}
          />

          <div className="flex gap-2">
            <Button disabled={isUploading} size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
              {uploadProfileImageAction.isPending ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Camera className="mr-1.5 size-3.5" />}
              {user?.profileImageUrl ? "변경" : "업로드"}
            </Button>
            {user?.profileImageUrl ? (
              <Button
                disabled={isUploading}
                size="sm"
                variant="outline"
                onClick={() => deleteProfileImageAction.mutate()}
              >
                {deleteProfileImageAction.isPending ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Trash2 className="mr-1.5 size-3.5" />}
                제거
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid min-w-0 flex-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="user-profile-name">이름</Label>
            <Input id="user-profile-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-profile-email">이메일</Label>
            <Input
              className="bg-muted/50"
              disabled
              id="user-profile-email"
              value={user?.email ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-profile-phone">연락처</Label>
            <Input
              id="user-profile-phone"
              placeholder="010-0000-0000"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          disabled={!isDirty || updateProfileAction.isPending}
          onClick={() => updateProfileAction.mutate({ name, phone })}
        >
          {updateProfileAction.isPending ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
          저장
        </Button>
      </div>
    </div>
  );
}
