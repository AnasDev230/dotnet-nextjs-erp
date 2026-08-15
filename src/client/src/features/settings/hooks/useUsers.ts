import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/error-handler";
import {
  createUser,
  fetchUsers,
  toggleUserActive,
  updateUser,
  type FetchUsersParams,
} from "../api/users";
import type {
  CreateUserRequest,
  PagedResult,
  UpdateUserRequest,
  UserListItem,
} from "@/types/settings";

export function useUsers(params: FetchUsersParams = {}) {
  return useQuery({
    queryKey: ["settings-users", params],
    queryFn: () => fetchUsers(params),
  });
}

export function useUser(id: string) {
  return useQuery<PagedResult<UserListItem>, Error, UserListItem | undefined>({
    queryKey: ["settings-users", { page: 1, pageSize: 100 }],
    queryFn: () => fetchUsers({ page: 1, pageSize: 100 }),
    select: (data) => data.items.find((u) => u.id === id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings-users"] });
      success(t("toast.created"));
    },
    onError: (err) => {
      error(
        t("toast.error.generic"),
        getErrorMessage(err) || t("common.unexpectedError")
      );
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings-users"] });
      success(t("toast.updated"));
    },
    onError: (err) => {
      error(
        t("toast.error.generic"),
        getErrorMessage(err) || t("common.unexpectedError")
      );
    },
  });
}

export function useToggleUserActive() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => toggleUserActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings-users"] });
      success(t("toast.statusChanged"));
    },
    onError: (err) => {
      error(
        t("toast.error.generic"),
        getErrorMessage(err) || t("common.unexpectedError")
      );
    },
  });
}