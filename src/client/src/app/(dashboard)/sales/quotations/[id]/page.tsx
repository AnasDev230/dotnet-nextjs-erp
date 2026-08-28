"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Pencil,
  Printer,
  Repeat,
  Send,
  ShoppingCart,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { QuotationPrint } from "@/components/print/quotation-print";
import { usePrint } from "@/hooks/use-print";
import {
  useAcceptQuotation,
  useConvertQuotation,
  useDeleteQuotation,
  useQuotation,
  useRejectQuotation,
  useSendQuotation,
} from "@/features/sales/hooks/useQuotations";
import {
  getQuotationStatusConfig,
  normalizeQuotationStatus,
  QuotationStatus,
} from "@/features/sales/types/quotation.types";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency, formatDate } from "@/lib/formatters";

type ConfirmAction = "send" | "accept" | "reject" | "convert" | "delete" | null;

export default function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { t, language } = useTranslation();
  const { handlePrint } = usePrint();
  const [showPrint, setShowPrint] = useState(false);

  const { data: quotation, isLoading } = useQuotation(id);
  const sendMutation = useSendQuotation();
  const acceptMutation = useAcceptQuotation();
  const rejectMutation = useRejectQuotation();
  const convertMutation = useConvertQuotation();
  const deleteMutation = useDeleteQuotation();

  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{t("common.notFound")}</p>
      </div>
    );
  }

  const normalizedStatus = normalizeQuotationStatus(quotation.status);
  const config = getQuotationStatusConfig(quotation.status);
  const isExpired =
    normalizedStatus === QuotationStatus.Expired ||
    (normalizedStatus === QuotationStatus.Sent &&
      new Date(quotation.expiryDate) < new Date());

  const isPendingAnyAction =
    sendMutation.isPending ||
    acceptMutation.isPending ||
    rejectMutation.isPending ||
    convertMutation.isPending ||
    deleteMutation.isPending;

  const handleConfirm = async () => {
    try {
      if (confirmAction === "send") await sendMutation.mutateAsync(id);
      else if (confirmAction === "accept") await acceptMutation.mutateAsync(id);
      else if (confirmAction === "reject") await rejectMutation.mutateAsync(id);
      else if (confirmAction === "convert") {
        const result = await convertMutation.mutateAsync({ id });
        setConfirmAction(null);
        router.push(`/sales/orders/${result.salesOrderId}`);
        return;
      } else if (confirmAction === "delete") {
        await deleteMutation.mutateAsync(id);
        router.push("/sales/quotations");
        return;
      }
    } catch {
      // Errors surfaced via toasts
    }
    setConfirmAction(null);
  };

  const confirmConfig: Record<
    Exclude<ConfirmAction, null>,
    { titleKey: string; descriptionKey: string; variant: "info" | "danger" }
  > = {
    send: {
      titleKey: "quotation.confirm.send.title",
      descriptionKey: "quotation.confirm.send.description",
      variant: "info",
    },
    accept: {
      titleKey: "quotation.confirm.accept.title",
      descriptionKey: "quotation.confirm.accept.description",
      variant: "info",
    },
    reject: {
      titleKey: "quotation.confirm.reject.title",
      descriptionKey: "quotation.confirm.reject.description",
      variant: "danger",
    },
    convert: {
      titleKey: "quotation.confirm.convert.title",
      descriptionKey: "quotation.confirm.convert.description",
      variant: "info",
    },
    delete: {
      titleKey: "quotation.confirm.delete.title",
      descriptionKey: "quotation.confirm.delete.description",
      variant: "danger",
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold font-mono">
                {quotation.quotationNumber}
              </h1>
              <Badge variant={config.badgeVariant}>{t(config.labelKey)}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDate(quotation.createdAt, language)}
            </p>
          </div>
        </div>

        {/* Conditional actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowPrint(true)}
          >
            <Printer className="h-4 w-4" />
            {t("common.print")}
          </Button>
          {normalizedStatus === QuotationStatus.Draft && (
            <>
              <Button
                className="gap-2"
                disabled={isPendingAnyAction}
                onClick={() => setConfirmAction("send")}
              >
                <Send className="h-4 w-4" />
                {t("quotation.send")}
              </Button>
              <Link href={`/sales/quotations/${id}/edit`}>
                <Button variant="outline" className="gap-2">
                  <Pencil className="h-4 w-4" />
                  {t("common.edit")}
                </Button>
              </Link>
              <Button
                variant="outline"
                className="gap-2 text-destructive hover:text-destructive"
                disabled={isPendingAnyAction}
                onClick={() => setConfirmAction("delete")}
              >
                <Trash2 className="h-4 w-4" />
                {t("common.delete")}
              </Button>
            </>
          )}

          {normalizedStatus === QuotationStatus.Sent && (
            <>
              <Button
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                disabled={isPendingAnyAction || isExpired}
                onClick={() => setConfirmAction("accept")}
              >
                <CheckCircle2 className="h-4 w-4" />
                {t("quotation.accept")}
              </Button>
              <Button
                variant="outline"
                className="gap-2 text-destructive hover:text-destructive"
                disabled={isPendingAnyAction}
                onClick={() => setConfirmAction("reject")}
              >
                <XCircle className="h-4 w-4" />
                {t("quotation.reject")}
              </Button>
            </>
          )}

          {normalizedStatus === QuotationStatus.Accepted && (
            <Button
              size="lg"
              className="gap-2"
              disabled={isPendingAnyAction}
              onClick={() => setConfirmAction("convert")}
            >
              <Repeat className="h-5 w-5" />
              {t("quotation.convert")}
            </Button>
          )}
        </div>
      </div>

      {/* Expired warning */}
      {isExpired && normalizedStatus !== QuotationStatus.Expired && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-600">
          {t("quotation.expiredWarning")}
        </div>
      )}

      {/* Converted link */}
      {quotation.convertedSalesOrderId && (
        <Link href={`/sales/orders/${quotation.convertedSalesOrderId}`}>
          <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm flex items-center justify-between hover:bg-muted/40 transition-colors">
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              {t("quotation.convertedTo")}
            </span>
            <span className="font-mono text-xs text-primary">
              {quotation.convertedSalesOrderNumber}
            </span>
          </div>
        </Link>
      )}

      {/* Info card */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("quotation.info")}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {t("quotation.customer")}
              </dt>
              <dd className="text-sm font-medium">{quotation.customerName}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {t("quotation.quotationDate")}
              </dt>
              <dd className="text-sm">
                {formatDate(quotation.quotationDate, language)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {t("quotation.expiryDate")}
              </dt>
              <dd className={`text-sm ${isExpired ? "text-destructive" : ""}`}>
                {formatDate(quotation.expiryDate, language)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {t("quotation.netAmount")}
              </dt>
              <dd className="text-sm font-semibold tabular-nums">
                {formatCurrency(quotation.netAmount, language)}
              </dd>
            </div>
          </dl>

          {quotation.notes && (
            <div className="mt-4 rounded-lg bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {t("quotation.notes")}
              </p>
              <p className="text-sm whitespace-pre-wrap">{quotation.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Items */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("quotation.items")}</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("quotation.product")}
                </TableHead>
                <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("quotation.quantity")}
                </TableHead>
                <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("quotation.unitPrice")}
                </TableHead>
                <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("quotation.discountPercent")}
                </TableHead>
                <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-end">
                  {t("quotation.lineTotal")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotation.items.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="px-4 py-3 text-sm">
                    <div className="font-medium">{item.productName}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {item.productSku}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm tabular-nums">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm tabular-nums">
                    {formatCurrency(item.unitPrice, language)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm tabular-nums">
                    {item.discountPercent}%
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm tabular-nums text-end">
                    {formatCurrency(item.lineTotal, language)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totals */}
          <div className="mx-4 mt-4 max-w-sm ms-auto space-y-2 text-sm rounded-lg bg-muted/40 p-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("quotation.subtotal")}
              </span>
              <span className="tabular-nums">
                {formatCurrency(quotation.subtotal, language)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("quotation.discountAmount")}
              </span>
              <span className="tabular-nums">
                −{formatCurrency(quotation.discountAmount, language)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("quotation.taxAmount")}
              </span>
              <span className="tabular-nums">
                +{formatCurrency(quotation.taxAmount, language)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
              <span>{t("quotation.netAmount")}</span>
              <span className="tabular-nums">
                {formatCurrency(quotation.netAmount, language)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirm dialogs */}
      {confirmAction && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setConfirmAction(null)}
          title={t(confirmConfig[confirmAction].titleKey)}
          description={t(confirmConfig[confirmAction].descriptionKey)}
          confirmLabel={
            confirmAction === "convert"
              ? t("quotation.convert")
              : t("common.confirm")
          }
          variant={confirmConfig[confirmAction].variant}
          isLoading={isPendingAnyAction}
          onConfirm={handleConfirm}
        />
      )}

      {showPrint && (
        <div className="fixed inset-0 z-50 bg-white overflow-auto">
          <div className="no-print flex items-center justify-between p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-lg">{t("print.preview")}</h3>
            <div className="flex gap-2">
              <Button onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                {t("print.print")}
              </Button>
              <Button variant="outline" onClick={() => setShowPrint(false)}>
                {t("print.close")}
              </Button>
            </div>
          </div>
          <QuotationPrint quotation={quotation} />
        </div>
      )}
    </div>
  );
}
