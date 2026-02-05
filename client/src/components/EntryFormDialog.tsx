import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Sparkles } from "lucide-react";

import type { DayEntryResponse } from "@shared/routes";
import { api } from "@shared/routes";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const formSchema = api.dayEntries.create.input.extend({
  thickness: z.coerce.number(),
  winding: z.coerce.number().int(),
});

export type DayEntryFormValues = z.infer<typeof formSchema>;

function handleEnterKey(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === "Enter") {
    e.preventDefault();
    const form = e.currentTarget.form;
    if (!form) return;
    const inputs = Array.from(form.querySelectorAll("input:not([type=hidden]), textarea"));
    const currentIndex = inputs.indexOf(e.currentTarget);
    const nextInput = inputs[currentIndex + 1] as HTMLInputElement | undefined;
    if (nextInput) {
      nextInput.focus();
      nextInput.select?.();
    }
  }
}

function toDefaults(date: string, entry?: DayEntryResponse | null): DayEntryFormValues {
  return {
    date: entry?.date ?? date,
    counterparty: entry?.counterparty ?? "",
    productName: entry?.productName ?? "",
    thickness: (entry?.thickness ?? 0) as any,
    winding: (entry?.winding ?? 0) as any,
    workType: entry?.workType ?? "PVC",
    emboss: entry?.emboss ?? "민자",
    size: entry?.size ?? "18",
    note: entry?.note ?? "",
  };
}

export default function EntryFormDialog({
  mode,
  open,
  onOpenChange,
  selectedDate,
  entry,
  onSubmit,
  isPending,
  trigger,
}: {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selectedDate: string;
  entry?: DayEntryResponse | null;
  onSubmit: (values: DayEntryFormValues) => void;
  isPending?: boolean;
  trigger?: React.ReactNode;
}) {
  const form = useForm<DayEntryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: toDefaults(selectedDate, entry),
    mode: "onChange",
  });

  React.useEffect(() => {
    if (open) {
      form.reset(toDefaults(selectedDate, entry));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedDate, entry?.id]);

  const title = mode === "create" ? "새 입력" : "입력 수정";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent
        data-testid={mode === "create" ? "entry-create-dialog" : "entry-edit-dialog"}
        className={cn(
          "max-w-2xl rounded-3xl border-border/70 p-0",
          "bg-gradient-to-br from-card/92 to-card/80 backdrop-blur-xl",
          "shadow-[var(--shadow-xl)]",
          "max-h-[90vh] overflow-hidden",
        )}
      >
        <div className="p-6 sm:p-7 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </span>
              {title}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 rounded-2xl border border-border/70 bg-background/40 p-4">
            <div className="text-xs text-muted-foreground">선택 일자</div>
            <div
              className="mt-1 text-base font-semibold tracking-tight"
              data-testid="entry-form-selected-date"
            >
              {selectedDate}
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>일자 (YYYY-MM-DD)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onKeyDown={handleEnterKey}
                        data-testid="field-date"
                        placeholder="2026-02-04"
                        className="h-11 rounded-xl bg-background/70"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="counterparty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>거래처</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onKeyDown={handleEnterKey}
                        data-testid="field-counterparty"
                        placeholder="예: DS데코"
                        className="h-11 rounded-xl bg-background/70"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>품명</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onKeyDown={handleEnterKey}
                        data-testid="field-productName"
                        placeholder="예: 330-12"
                        className="h-11 rounded-xl bg-background/70"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thickness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>두께</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onKeyDown={handleEnterKey}
                        data-testid="field-thickness"
                        type="number"
                        step="0.01"
                        placeholder="0.60"
                        className="h-11 rounded-xl bg-background/70"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="winding"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>권취</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onKeyDown={handleEnterKey}
                        data-testid="field-winding"
                        type="number"
                        placeholder="100"
                        className="h-11 rounded-xl bg-background/70"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>작업</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onKeyDown={handleEnterKey}
                        data-testid="field-workType"
                        placeholder="예: PVC"
                        className="h-11 rounded-xl bg-background/70"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emboss"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>엠보</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onKeyDown={handleEnterKey}
                        data-testid="field-emboss"
                        placeholder="예: 민자"
                        className="h-11 rounded-xl bg-background/70"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>사이즈</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onKeyDown={handleEnterKey}
                        data-testid="field-size"
                        placeholder="18"
                        className="h-11 rounded-xl bg-background/70"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>기타</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        data-testid="field-note"
                        placeholder="메모/특이사항"
                        className="min-h-[96px] rounded-2xl bg-background/70"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="sm:col-span-2 mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 rounded-xl"
                  data-testid="entry-form-cancel"
                  onClick={() => onOpenChange(false)}
                >
                  닫기
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !form.formState.isValid}
                  className={cn(
                    "h-11 rounded-xl font-semibold",
                    "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground",
                    "shadow-lg shadow-primary/20",
                    "hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5",
                    "active:translate-y-0 active:shadow-md",
                    "transition-all duration-200 ease-out",
                  )}
                  data-testid="entry-form-submit"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isPending ? "저장 중..." : "저장"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
