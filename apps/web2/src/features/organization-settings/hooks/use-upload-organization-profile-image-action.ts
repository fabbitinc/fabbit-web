import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadSingleFile } from "@/api/file.api";
import { refreshAuthSession, useAuthStore } from "@/features/auth";
import { setOrganizationProfileImage } from "@/features/organization-settings/api/organization-settings.api";
import { extractApiError } from "@/lib/api-error";

function validateImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("파일 크기는 5MB 이하만 가능합니다.");
  }
}

export function useUploadOrganizationProfileImageAction() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationKey: ["organization-settings", "upload-organization-profile-image-action"],
    mutationFn: async (file: File) => {
      validateImageFile(file);
      const fileId = await uploadSingleFile(file);
      return setOrganizationProfileImage({ file_id: fileId });
    },
    onSuccess: async () => {
      const session = await refreshAuthSession(queryClient);
      setSession(session);
      toast.success("조직 프로필 이미지를 변경했습니다.");
    },
    onError: (error) => {
      toast.error(extractApiError(error, "조직 이미지 업로드에 실패했습니다."));
    },
  });
}
