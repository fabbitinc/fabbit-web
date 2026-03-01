import { apiClient } from "./client";
import type {
  UpdateProfileRequest,
  UpdateProfileResponse,
  SetProfileImageRequest,
  ProfileImageResponse,
} from "./types";

/**
 * 프로필 수정
 * PATCH /api/v1/users/me
 */
export async function updateProfile(
  request: UpdateProfileRequest,
): Promise<UpdateProfileResponse> {
  const response = await apiClient.patch<UpdateProfileResponse>(
    "/api/v1/users/me",
    request,
  );
  return response.data;
}

/**
 * 프로필 이미지 설정
 * PUT /api/v1/users/me/profile-image
 */
export async function setProfileImage(
  request: SetProfileImageRequest,
): Promise<ProfileImageResponse> {
  const response = await apiClient.put<ProfileImageResponse>(
    "/api/v1/users/me/profile-image",
    request,
  );
  return response.data;
}

/**
 * 프로필 이미지 제거
 * DELETE /api/v1/users/me/profile-image
 */
export async function deleteProfileImage(): Promise<void> {
  await apiClient.delete("/api/v1/users/me/profile-image");
}
