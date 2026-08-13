"use client";

import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
} from "@/components/ui";
import {
  createUserFormSchema,
  type CreateUserFormData,
} from "../schemas/create-user.schema";
import {
  updateUserFormSchema,
  type UpdateUserFormData,
} from "../schemas/update-user.schema";
import { useCreateUser, useUpdateUser } from "../hooks/useUsers";
import { roleOptions } from "../lib/roles";
import type { UserListItem } from "@/types/settings";
import type { ApiResponse } from "@/types/auth";
import { useTranslation } from "@/hooks/use-translation";

interface UserFormProps {
  mode: "create" | "edit";
  user?: UserListItem;
  lockRole?: boolean;
}

export default function UserForm({ mode, user, lockRole = false }: UserFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const { t } = useTranslation();

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const createResolver = zodResolver(createUserFormSchema) as Resolver<CreateUserFormData>;
  const updateResolver = zodResolver(updateUserFormSchema) as Resolver<UpdateUserFormData>;

  const createForm = useForm<CreateUserFormData>({
    resolver: createResolver,
    defaultValues: {
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      role: "",
    },
  });

  const updateForm = useForm<UpdateUserFormData>({
    resolver: updateResolver,
    defaultValues: {
      fullName: user?.fullName ?? "",
      role: user?.role ?? "",
    },
  });

  const getErrorMessage = (error: unknown): string => {
    if (!error) return "";
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    const message = axiosError.response?.data?.message;
    if (message) return message;
    return error instanceof Error ? error.message : "";
  };

  const onSubmitCreate = async (data: CreateUserFormData) => {
    try {
      await createMutation.mutateAsync({
        userName: data.userName.trim(),
        email: data.email.trim(),
        password: data.password,
        fullName: data.fullName.trim(),
        role: data.role,
      });
      router.push("/settings/users");
    } catch {
      // Error handled via mutation state
    }
  };

  const onSubmitUpdate = async (data: UpdateUserFormData) => {
    if (!user) return;
    try {
      await updateMutation.mutateAsync({
        id: user.id,
        data: {
          fullName: data.fullName.trim(),
          role: data.role,
        },
      });
      router.push("/settings/users");
    } catch {
      // Error handled via mutation state
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {isEdit ? t("settings.users.editTitle") : t("settings.users.newTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <p>{getErrorMessage(error) || t("common.unexpectedError")}</p>
          </Alert>
        )}

        <form
          onSubmit={
            isEdit
              ? updateForm.handleSubmit(onSubmitUpdate)
              : createForm.handleSubmit(onSubmitCreate)
          }
          className="space-y-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            {!isEdit && (
              <>
                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="userName">
                    {t("settings.users.username")} *
                  </Label>
                  <Input
                    id="userName"
                    {...createForm.register("userName")}
                    className="h-10"
                  />
                  {createForm.formState.errors.userName && (
                    <p className="text-sm text-destructive">
                      {createForm.formState.errors.userName.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">{t("settings.users.email")} *</Label>
                  <Input
                    id="email"
                    type="email"
                    dir="ltr"
                    {...createForm.register("email")}
                    className="h-10"
                  />
                  {createForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {createForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">
                    {t("settings.users.password")} *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    {...createForm.register("password")}
                    className="h-10"
                  />
                  {createForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {createForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    {t("settings.users.confirmPassword")} *
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...createForm.register("confirmPassword")}
                    className="h-10"
                  />
                  {createForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {createForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">
                {t("settings.users.fullName")} *
              </Label>
              <Input
                id="fullName"
                {...(isEdit ? updateForm.register("fullName") : createForm.register("fullName"))}
                className="h-10"
              />
              {isEdit
                ? updateForm.formState.errors.fullName && (
                    <p className="text-sm text-destructive">
                      {updateForm.formState.errors.fullName.message}
                    </p>
                  )
                : createForm.formState.errors.fullName && (
                    <p className="text-sm text-destructive">
                      {createForm.formState.errors.fullName.message}
                    </p>
                  )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">{t("settings.users.role")} *</Label>
              <Select
                id="role"
                {...(isEdit ? updateForm.register("role") : createForm.register("role"))}
                options={roleOptions.map((option) => ({
                  value: option.value,
                  label: t(option.labelKey),
                }))}
                placeholder={t("settings.users.role")}
                className="h-10"
                disabled={lockRole}
              />
              {isEdit
                ? updateForm.formState.errors.role && (
                    <p className="text-sm text-destructive">
                      {updateForm.formState.errors.role.message}
                    </p>
                  )
                : createForm.formState.errors.role && (
                    <p className="text-sm text-destructive">
                      {createForm.formState.errors.role.message}
                    </p>
                  )}
              {lockRole && (
                <p className="text-xs text-muted-foreground">
                  {t("settings.users.selfRoleHint")}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? t("common.saveChanges") : t("settings.users.new")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/settings/users")}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}