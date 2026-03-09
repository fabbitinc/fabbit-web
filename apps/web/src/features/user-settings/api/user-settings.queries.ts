import { mutationOptions } from "@tanstack/react-query";
import {
  changeUserPassword,
  deleteUserProfileImage,
  setUserProfileImage,
  updateUserProfile,
} from "@/features/user-settings/api/user-settings.api";
import type {
  ChangePasswordRequestDto,
  SetProfileImageRequestDto,
  UpdateProfileRequestDto,
} from "@/features/user-settings/api/user-settings.types";

export const userSettingsMutations = {
  updateProfile: () =>
    mutationOptions({
      mutationKey: ["user-settings", "update-profile"],
      mutationFn: (request: UpdateProfileRequestDto) => updateUserProfile(request),
    }),
  changePassword: () =>
    mutationOptions({
      mutationKey: ["user-settings", "change-password"],
      mutationFn: (request: ChangePasswordRequestDto) => changeUserPassword(request),
    }),
  setProfileImage: () =>
    mutationOptions({
      mutationKey: ["user-settings", "set-profile-image"],
      mutationFn: (request: SetProfileImageRequestDto) => setUserProfileImage(request),
    }),
  deleteProfileImage: () =>
    mutationOptions({
      mutationKey: ["user-settings", "delete-profile-image"],
      mutationFn: () => deleteUserProfileImage(),
    }),
};
