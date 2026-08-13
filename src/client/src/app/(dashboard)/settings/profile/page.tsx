"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import {
  AtSign,
  CheckCircle2,
  ChevronDown,
  Clock,
  KeyRound,
  Loader2,
  Pencil,
  Shield,
  User,
  X,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
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

  // ─── Collapsible State ───
  const [isEditingName, setIsEditingName] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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
    return axiosError.response?.data?.message || (error instanceof Error ? error.message : "");
  };

  const onUpdateName = async (data: { fullName: string }) => {
    try {
      await updateProfileMutation.mutateAsync({ fullName: data.fullName.trim() });
      setIsEditingName(false);
    } catch {
      // handled via mutation state
    }
  };

  const onChangePassword = async (data: ChangePasswordFormData) => {
    try {
      await changePasswordMutation.mutateAsync(data);
      passwordForm.reset();
      setIsChangingPassword(false);
    } catch {
      // handled via mutation state
    }
  };

  const handleCancelEdit = () => {
    nameForm.reset({ fullName: profile?.fullName ?? "" });
    setIsEditingName(false);
  };

  const handleCancelPassword = () => {
    passwordForm.reset();
    setIsChangingPassword(false);
  };

  // ─── Loading ───
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1.5">
          <div className="h-7 w-48 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-80 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  // ─── Error ───
  if (isError || !profile) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{t("common.loadFailed")}</AlertDescription>
      </Alert>
    );
  }

  const roleLabel = roleKeyMap[profile.role] ? t(roleKeyMap[profile.role]) : profile.role;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* ─── Page Header ─── */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {t("settings.profile.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("settings.profile.description")}
        </p>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* SECTION 1: Account Information (Read-only) */}
      {/* ═══════════════════════════════════════ */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            {t("settings.profile.infoTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Full Name */}
            <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-500/10">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{t("settings.profile.fullName")}</p>
                <p className="truncate text-sm font-medium text-foreground">
                  {profile.fullName || profile.userName}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-violet-500/10">
                <AtSign className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{t("settings.profile.email")}</p>
                <p className="truncate text-sm font-medium text-foreground" dir="ltr">
                  {profile.email ?? "—"}
                </p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-500/10">
                <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{t("settings.profile.role")}</p>
                <Badge
                  variant="secondary"
                  className="mt-0.5 rounded bg-emerald-500/10 text-xs font-medium text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
                >
                  {roleLabel}
                </Badge>
              </div>
            </div>

            {/* Last Login */}
            <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-500/10">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{t("settings.profile.lastLogin")}</p>
                <p className="truncate text-sm font-medium text-foreground">
                  {profile.lastLogin ? formatDate(profile.lastLogin, language) : "—"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════ */}
      {/* SECTION 2: Edit Name (Collapsible) */}
      {/* ═══════════════════════════════════════ */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              {t("settings.profile.editTitle")}
            </CardTitle>
            {!isEditingName && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingName(true)}
                className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" />
                {t("common.edit")}
              </Button>
            )}
          </div>
        </CardHeader>

        {isEditingName && (
          <CardContent className="border-t border-border pt-4">
            {/* Success */}
            {updateProfileMutation.isSuccess && !isEditingName && (
              <Alert className="mb-4 border-emerald-500/20 bg-emerald-500/5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <AlertDescription className="text-emerald-700 dark:text-emerald-400">
                  {t("settings.profile.profileUpdated")}
                </AlertDescription>
              </Alert>
            )}

            {/* Error */}
            {updateProfileMutation.error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  {getErrorMessage(updateProfileMutation.error)}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={nameForm.handleSubmit(onUpdateName)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  {t("settings.profile.fullName")}
                </Label>
                <Input
                  id="fullName"
                  {...nameForm.register("fullName")}
                  className="h-10"
                  autoFocus
                />
                {nameForm.formState.errors.fullName && (
                  <p className="text-xs text-destructive">
                    {nameForm.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" size="sm" className="h-9 gap-2" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {t("common.save")}
                </Button>
                <Button type="button" variant="ghost" size="sm" className="h-9 gap-1.5" onClick={handleCancelEdit}>
                  <X className="h-3.5 w-3.5" />
                  {t("common.cancel")}
                </Button>
              </div>
            </form>
          </CardContent>
        )}

        {!isEditingName && (
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              {profile.fullName || "—"}
            </p>
          </CardContent>
        )}
      </Card>

      {/* ═══════════════════════════════════════ */}
      {/* SECTION 3: Change Password (Collapsible) */}
      {/* ═══════════════════════════════════════ */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              {t("settings.profile.changePassword")}
            </CardTitle>
            {!isChangingPassword && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChangingPassword(true)}
                className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <KeyRound className="h-3.5 w-3.5" />
                {t("common.edit")}
              </Button>
            )}
          </div>
        </CardHeader>

        {isChangingPassword && (
          <CardContent className="border-t border-border pt-4">
            {/* Error */}
            {changePasswordMutation.error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  {getErrorMessage(changePasswordMutation.error)}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-medium">
                  {t("settings.profile.currentPassword")}
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...passwordForm.register("currentPassword")}
                  className="h-10"
                  placeholder="••••••••"
                  autoFocus
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-xs text-destructive">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              {/* New + Confirm */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium">
                    {t("settings.profile.newPassword")}
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...passwordForm.register("newPassword")}
                    className="h-10"
                    placeholder="••••••••"
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-xs text-destructive">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword" className="text-sm font-medium">
                    {t("settings.profile.confirmPassword")}
                  </Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    {...passwordForm.register("confirmNewPassword")}
                    className="h-10"
                    placeholder="••••••••"
                  />
                  {passwordForm.formState.errors.confirmNewPassword && (
                    <p className="text-xs text-destructive">
                      {passwordForm.formState.errors.confirmNewPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" size="sm" className="h-9 gap-2" disabled={changePasswordMutation.isPending}>
                  {changePasswordMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <KeyRound className="h-3.5 w-3.5" />
                  )}
                  {t("settings.profile.changePassword")}
                </Button>
                <Button type="button" variant="ghost" size="sm" className="h-9 gap-1.5" onClick={handleCancelPassword}>
                  <X className="h-3.5 w-3.5" />
                  {t("common.cancel")}
                </Button>
              </div>
            </form>
          </CardContent>
        )}

        {!isChangingPassword && (
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">••••••••</p>
          </CardContent>
        )}
      </Card>

      {/* ─── Global Success Toast (after save) ─── */}
      {(updateProfileMutation.isSuccess || changePasswordMutation.isSuccess) && (
        <Alert className="border-emerald-500/20 bg-emerald-500/5">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription className="text-emerald-700 dark:text-emerald-400">
            {updateProfileMutation.isSuccess && t("settings.profile.profileUpdated")}
            {changePasswordMutation.isSuccess && (
              <>
                {t("settings.profile.passwordChanged")}
                <span className="mt-0.5 block text-xs opacity-75">
                  {t("settings.profile.reLoginSuggestion")}
                </span>
              </>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}