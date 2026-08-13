import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { changePassword, fetchProfile, updateProfile } from "../api/profile";
import type {
  ChangePasswordRequest,
  UpdateProfileRequest,
} from "@/types/settings";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePassword(data),
  });
}