"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { AtSign, Clock, KeyRound, Loader2, Shield, User } from "lucide-react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";
import { formatDate } from "@/lib/formatters";
import {
  useChangePassword,
  useProfile,
  useUpdateProfile,
} from "@/features/settings/hooks/useProfile";
import {
  changePasswordFormSchema,
  type ChangePasswordFormData,
} from "@/features/settings/schemas/change-password.schema";
import { roleKeyMap } from "@/features/settings/lib/roles";
import type { ApiResponse } from "@/types/auth";

export default function SettingsProfilePage() {
  const { t, language } = useTranslation();
  const { data: profile, isLoading, isError } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const zodResolverTyped = zodResolver(changePasswordFormSchema) as Resolver<ChangePasswordFormData>;

  const nameForm = useForm<{ fullName: string }>({
    defaultValues: { fullName: "" },
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolverTyped,
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  useEffect(() => {
    if (profile?.fullName) {
      nameForm.reset({ fullName: profile.fullName });
    }
  }, [profile, nameForm]);

  const getErrorMessage = (error: unknown): string => {
    if (!error) return "";
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    const message = axiosError.response?.data?.message;
    if (message) return message;
    return error instanceof Error ? error.message : "";
  };

  const onUpdateName = async (data: { fullName: string }) => {
    try {
      await updateProfileMutation.mutateAsync({ fullName: data.fullName.trim() });
    } catch {
      // Error handled via mutation state
    }
  };

  const onChangePassword = async (data: ChangePasswordFormData) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      });
      passwordForm.reset();
    } catch {
      // Error handled via mutation state
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <Alert variant="destructive">
        <p>{t("common.loadFailed")}</p>
      </Alert>
    );
  }

  const roleLabel = roleKeyMap[profile.role] ? t(roleKeyMap[profile.role]) : profile.role;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("settings.profile.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("profile.description")}</p>
      </div>

      {/* Account Info */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("settings.profile.infoTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium">{profile.userName}</p>
              <p className="text-xs text-muted-foreground">
                {t("settings.profile.username")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <AtSign className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium" dir="ltr">
                {profile.email ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("settings.profile.email")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <Badge className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary hover:bg-primary/10">
                {roleLabel}
              </Badge>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("settings.profile.role")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium">
                {profile.lastLogin ? formatDate(profile.lastLogin, language) : "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("settings.profile.lastLogin")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Full Name */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("settings.profile.editTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {updateProfileMutation.isSuccess && (
            <Alert className="border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <p>{t("settings.profile.profileUpdated")}</p>
            </Alert>
          )}
          {updateProfileMutation.error && (
            <Alert variant="destructive">
              <p>
                {t("common.error")}: {getErrorMessage(updateProfileMutation.error)}
              </p>
            </Alert>
          )}

          <form onSubmit={nameForm.handleSubmit(onUpdateName)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t("settings.profile.fullName")}</Label>
              <Input id="fullName" {...nameForm.register("fullName")} className="h-10" />
              {nameForm.formState.errors.fullName && (
                <p className="text-sm text-destructive">
                  {nameForm.formState.errors.fullName.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={updateProfileMutation.isPending} className="gap-2">
              {updateProfileMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {t("settings.profile.saveChanges")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("settings.profile.changePassword")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {changePasswordMutation.isSuccess && (
            <Alert className="border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <p>{t("settings.profile.passwordChanged")}</p>
              <p className="mt-1 text-sm">{t("settings.profile.reLoginSuggestion")}</p>
            </Alert>
          )}
          {changePasswordMutation.error && (
            <Alert variant="destructive">
              <p>
                {t("common.error")}: {getErrorMessage(changePasswordMutation.error)}
              </p>
            </Alert>
          )}

          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">
                {t("settings.profile.currentPassword")}
              </Label>
              <Input
                id="currentPassword"
                type="password"
                {...passwordForm.register("currentPassword")}
                className="h-10"
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("settings.profile.newPassword")}</Label>
              <Input
                id="newPassword"
                type="password"
                {...passwordForm.register("newPassword")}
                className="h-10"
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">
                {t("settings.profile.confirmPassword")}
              </Label>
              <Input
                id="confirmNewPassword"
                type="password"
                {...passwordForm.register("confirmNewPassword")}
                className="h-10"
              />
              {passwordForm.formState.errors.confirmNewPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.confirmNewPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={changePasswordMutation.isPending} className="gap-2">
              {changePasswordMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <KeyRound className="h-4 w-4" />
              {t("settings.profile.changePassword")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}