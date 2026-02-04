import * as React from "react";
import { Save, Plus, Trash2, ListPlus } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface BulkEntryRow {
  date: string;
  counterparty: string;
  productName: string;
  thickness: string;
  winding: string;
  workType: string;
  emboss: string;
  size: string;
  note: string;
}

function toShortDate(date: string): string {
  return date.startsWith("20") ? date.slice(2) : date;
}

function toFullDate(date: string): string {
  if (date.length === 8 && !date.startsWith("20")) {
    return "20" + date;
  }
  return date;
}

function createEmptyRow(date: string): BulkEntryRow {
  return {
    date: toShortDate(date),
    counterparty: "",
    productName: "",
    thickness: "",
    winding: "",
    workType: "",
    emboss: "",
    size: "",
    note: "",
  };
}

function createEmptyRows(date: string, count: number): BulkEntryRow[] {
  return Array.from({ length: count }, () => createEmptyRow(date));
}

export default function BulkEntryFormDialog({
  open,
  onOpenChange,
  selectedDate,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selectedDate: string;
  onSubmit: (rows: BulkEntryRow[]) => void;
  isPending?: boolean;
}) {
  const [rows, setRows] = React.useState<BulkEntryRow[]>(() => createEmptyRows(selectedDate, 10));

  React.useEffect(() => {
    if (open) {
      setRows(createEmptyRows(selectedDate, 10));
    }
  }, [open, selectedDate]);

  const updateRow = (index: number, field: keyof BulkEntryRow, value: string) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addRows = (count: number) => {
    setRows((prev) => [...prev, ...createEmptyRows(selectedDate, count)]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const filledRows = rows.filter(
    (r) =>
      r.counterparty.trim() &&
      r.productName.trim() &&
      r.thickness.trim() &&
      r.winding.trim() &&
      r.workType.trim() &&
      r.emboss.trim() &&
      r.size.trim()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filledRows.length === 0) return;
    const rowsWithFullDate = filledRows.map((r) => ({
      ...r,
      date: toFullDate(r.date),
    }));
    onSubmit(rowsWithFullDate);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="bulk-entry-dialog"
        className={cn(
          "max-w-5xl rounded-3xl border-border/70 p-0",
          "bg-gradient-to-br from-card/92 to-card/80 backdrop-blur-xl",
          "shadow-[var(--shadow-xl)]",
          "max-h-[90vh]"
        )}
      >
        <div className="p-6 sm:p-7 flex flex-col max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ListPlus className="h-4 w-4" />
              </span>
              10개 일괄 입력
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 rounded-2xl border border-border/70 bg-background/40 p-4">
            <div className="text-xs text-muted-foreground">선택 일자</div>
            <div className="mt-1 text-base font-semibold tracking-tight" data-testid="bulk-entry-selected-date">
              {toShortDate(selectedDate)}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">
                입력된 행: <span className="font-semibold text-foreground">{filledRows.length}</span> / {rows.length}
              </div>
              <Button
                type="button"
                variant="secondary"
                className="rounded-xl"
                onClick={() => addRows(10)}
                data-testid="add-10-rows"
              >
                <Plus className="mr-1 h-4 w-4" />
                10행 추가
              </Button>
            </div>

            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-3">
                {rows.map((row, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border/70 bg-background/40 p-3"
                    data-testid={`bulk-row-${idx}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-foreground">#{idx + 1}</div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeRow(idx)}
                        data-testid={`bulk-remove-row-${idx}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground">일자</label>
                        <Input
                          value={row.date}
                          onChange={(e) => updateRow(idx, "date", e.target.value)}
                          placeholder="YY-MM-DD"
                          className="h-9 text-sm rounded-lg mt-1"
                          data-testid={`bulk-field-date-${idx}`}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">거래처</label>
                        <Input
                          value={row.counterparty}
                          onChange={(e) => updateRow(idx, "counterparty", e.target.value)}
                          placeholder="거래처"
                          className="h-9 text-sm rounded-lg mt-1"
                          data-testid={`bulk-field-counterparty-${idx}`}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">품명</label>
                        <Input
                          value={row.productName}
                          onChange={(e) => updateRow(idx, "productName", e.target.value)}
                          placeholder="품명"
                          className="h-9 text-sm rounded-lg mt-1"
                          data-testid={`bulk-field-productName-${idx}`}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">두께</label>
                        <Input
                          value={row.thickness}
                          onChange={(e) => updateRow(idx, "thickness", e.target.value)}
                          placeholder="두께"
                          type="number"
                          step="0.01"
                          className="h-9 text-sm rounded-lg mt-1"
                          data-testid={`bulk-field-thickness-${idx}`}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">권취</label>
                        <Input
                          value={row.winding}
                          onChange={(e) => updateRow(idx, "winding", e.target.value)}
                          placeholder="권취"
                          type="number"
                          className="h-9 text-sm rounded-lg mt-1"
                          data-testid={`bulk-field-winding-${idx}`}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">작업</label>
                        <Input
                          value={row.workType}
                          onChange={(e) => updateRow(idx, "workType", e.target.value)}
                          placeholder="작업"
                          className="h-9 text-sm rounded-lg mt-1"
                          data-testid={`bulk-field-workType-${idx}`}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">엠보</label>
                        <Input
                          value={row.emboss}
                          onChange={(e) => updateRow(idx, "emboss", e.target.value)}
                          placeholder="엠보"
                          className="h-9 text-sm rounded-lg mt-1"
                          data-testid={`bulk-field-emboss-${idx}`}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">사이즈</label>
                        <Input
                          value={row.size}
                          onChange={(e) => updateRow(idx, "size", e.target.value)}
                          placeholder="사이즈"
                          type="number"
                          className="h-9 text-sm rounded-lg mt-1"
                          data-testid={`bulk-field-size-${idx}`}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">기타</label>
                        <Input
                          value={row.note}
                          onChange={(e) => updateRow(idx, "note", e.target.value)}
                          placeholder="기타"
                          className="h-9 text-sm rounded-lg mt-1"
                          data-testid={`bulk-field-note-${idx}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end border-t border-border/70 pt-4">
              <Button
                type="button"
                variant="secondary"
                className="h-11 rounded-xl"
                data-testid="bulk-entry-cancel"
                onClick={() => onOpenChange(false)}
              >
                닫기
              </Button>
              <Button
                type="submit"
                disabled={isPending || filledRows.length === 0}
                className={cn(
                  "h-11 rounded-xl font-semibold",
                  "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground",
                  "shadow-lg shadow-primary/20",
                  "hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5",
                  "active:translate-y-0 active:shadow-md",
                  "transition-all duration-200 ease-out"
                )}
                data-testid="bulk-entry-submit"
              >
                <Save className="mr-2 h-4 w-4" />
                {isPending ? "저장 중..." : `${filledRows.length}건 저장`}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
