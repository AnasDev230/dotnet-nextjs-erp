"use client";

import { useState } from "react";
import Link from "next/link";
import { Power, UserCog, Users } from "lucide-react";
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToggleUserActive } from "../hooks/useUsers";
import { roleKeyMap } from "../lib/roles";
import type { UserListItem } from "@/types/settings";
import { useTranslation } from "@/hooks/use-translation";
import { formatDate } from "@/lib/formatters";

const statusBadgeVariant = {
  active: "success",
  inactive: "destructive",
} as const;

interface UsersTableProps {
  users: UserListItem[];
  isLoading: boolean;
  currentUserId?: string;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function UsersTable({
  users,
  isLoading,
  currentUserId,
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
}: UsersTableProps) {
  const [toggleUser, setToggleUser] = useState<UserListItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const toggleMutation = useToggleUserActive();
  const { t, language } = useTranslation();

  const handleToggle = () => {
    if (!toggleUser) return;
    toggleMutation.mutate(toggleUser.id, {
      onSuccess: () => {
        setToggleUser(null);
        setErrorMessage(null);
      },
      onError: (error: any) => {
        setErrorMessage(
          error?.response?.data?.message ||
            error?.message ||
            t("common.unexpectedError")
        );
      },
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("common.name")}
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("settings.users.email")}
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("settings.users.role")}
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("settings.users.status")}
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("settings.users.lastLogin")}
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-end">
                {t("common.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <TableCell key={j} className="px-4 py-3">
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-border">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">{t("settings.users.emptyTitle")}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("settings.users.emptyDescription")}
        </p>
        <Link href="/settings/users/new">
          <Button className="gap-2">
            <UserCog className="h-4 w-4" />
            {t("settings.users.new")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("common.name")}
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("settings.users.email")}
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("settings.users.role")}
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("settings.users.status")}
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("settings.users.lastLogin")}
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-end">
                {t("common.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isSelf = currentUserId === user.id;
              const roleLabel = roleKeyMap[user.role]
                ? t(roleKeyMap[user.role])
                : user.role;

              return (
                <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="px-4 py-3">
                    <p className="font-medium">{user.fullName || user.userName}</p>
                    <p className="text-xs text-muted-foreground" dir="ltr">
                      {user.userName}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span className="text-sm" dir="ltr">
                      {user.email ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      variant="secondary"
                      className="rounded-md px-2.5 py-0.5 text-xs font-medium"
                    >
                      {roleLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      variant={
                        user.isActive
                          ? statusBadgeVariant.active
                          : statusBadgeVariant.inactive
                      }
                    >
                      {user.isActive
                        ? t("settings.users.active")
                        : t("settings.users.inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    {user.lastLogin ? formatDate(user.lastLogin, language) : "—"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-end">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/settings/users/${user.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <UserCog className="h-4 w-4" />
                        </Button>
                      </Link>
                      {!isSelf && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className={
                            user.isActive
                              ? "h-8 w-8 text-destructive"
                              : "h-8 w-8 text-emerald-500"
                          }
                          disabled={toggleMutation.isPending}
                          onClick={() => {
                            setErrorMessage(null);
                            setToggleUser(user);
                          }}
                        >
                          {user.isActive ? (
                            <Power className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4 rotate-180" />
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            {t("common.showing")} {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, totalCount)} {t("common.of")} {totalCount}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              {t("common.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              {t("common.next")}
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={toggleUser !== null}
        onOpenChange={(open) => {
          if (!open) {
            setToggleUser(null);
            setErrorMessage(null);
          }
        }}
        title={
          toggleUser?.isActive
            ? t("settings.users.deactivateTitle")
            : t("settings.users.activateTitle")
        }
        description={
          toggleUser?.isActive
            ? t("settings.users.deactivateDescription")
            : t("settings.users.activateDescription")
        }
        confirmLabel={
          toggleUser?.isActive
            ? t("settings.users.deactivate")
            : t("settings.users.activate")
        }
        variant={toggleUser?.isActive ? "danger" : "warning"}
        isLoading={toggleMutation.isPending}
        errorMessage={errorMessage}
        onConfirm={handleToggle}
      />
    </>
  );
}