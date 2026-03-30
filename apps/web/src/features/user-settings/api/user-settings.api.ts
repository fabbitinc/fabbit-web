import {
  userChangePassword as changePasswordApiV1UsersMePasswordPut,
  userDeleteProfileImage as deleteProfileImageApiV1UsersMeProfileImageDelete,
  userSetProfileImage as setProfileImageApiV1UsersMeProfileImagePut,
  userUpdateProfile as updateProfileApiV1UsersMePatch,
} from "@/api/generated/orval/users/users";
import type {
  ChangePasswordRequestDto,
  SetProfileImageRequestDto,
  UpdateProfileRequestDto,
} from "@/features/user-settings/api/user-settings.types";

export async function updateUserProfile(request: UpdateProfileRequestDto) {
  return updateProfileApiV1UsersMePatch(request);
}

export async function changeUserPassword(request: ChangePasswordRequestDto) {
  await changePasswordApiV1UsersMePasswordPut(request);
}

export async function setUserProfileImage(request: SetProfileImageRequestDto) {
  return setProfileImageApiV1UsersMeProfileImagePut(request);
}

export async function deleteUserProfileImage() {
  await deleteProfileImageApiV1UsersMeProfileImageDelete();
}
