import { apiClient } from "@/api/client";
import type {
  ChangePasswordRequestDto,
  ProfileImageResponseDto,
  SetProfileImageRequestDto,
  UpdateProfileRequestDto,
  UpdateProfileResponseDto,
} from "@/features/user-settings/api/user-settings.types";

export async function updateUserProfile(request: UpdateProfileRequestDto) {
  const response = await apiClient.patch<UpdateProfileResponseDto>("/api/v1/users/me", request);
  return response.data;
}

export async function changeUserPassword(request: ChangePasswordRequestDto) {
  await apiClient.put("/api/v1/users/me/password", request);
}

export async function setUserProfileImage(request: SetProfileImageRequestDto) {
  const response = await apiClient.put<ProfileImageResponseDto>("/api/v1/users/me/profile-image", request);
  return response.data;
}

export async function deleteUserProfileImage() {
  await apiClient.delete("/api/v1/users/me/profile-image");
}
