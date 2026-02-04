import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  destructive = false,
  onConfirm,
  isPending,
  "data-testid": dataTestId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  isPending?: boolean;
  "data-testid"?: string;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-testid={dataTestId} className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription className="text-base">
              {description}
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            data-testid={dataTestId ? `${dataTestId}-cancel` : undefined}
            className="rounded-xl"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            data-testid={dataTestId ? `${dataTestId}-confirm` : undefined}
            onClick={onConfirm}
            disabled={isPending}
            className={[
              "rounded-xl font-semibold transition-all duration-200",
              destructive
                ? "bg-destructive text-destructive-foreground hover:opacity-90"
                : "bg-primary text-primary-foreground hover:opacity-90",
            ].join(" ")}
          >
            {isPending ? "처리 중..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
