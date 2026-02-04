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

function createEmptyRow(date: string): BulkEntryRow {
  return {
    date,
    counterparty: "",
    productName: "",
    thickness: "",
    winding: "",
    workType: "PVC",
    emboss: "민자",
    size: "18",
    note: "",
  };
}

function createEmptyRows(date: string, count: number): BulkEntryRow[] {
  return Array.from({ length: count }, () => createEmptyRow(date));
}

const FIELDS_PER_ROW = 9;

function createKeyHandler(
  rows: BulkEntryRow[],
  updateRow: (index: number, field: keyof BulkEntryRow, value: string) => void
) {
  return (e: React.KeyboardEvent<HTMLInputElement>) => {
    const form = e.currentTarget.form;
    if (!form) return;
    const inputs = Array.from(form.querySelectorAll("input:not([type=hidden])")) as HTMLInputElement[];
    const currentIndex = inputs.indexOf(e.currentTarget);

    if (e.key === "Enter") {
      e.preventDefault();
      const nextInput = inputs[currentIndex + 1];
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && (e.key === '"' || e.key === "'")) {
      e.preventDefault();
      const testId = e.currentTarget.getAttribute("data-testid");
      if (!testId) return;
      
      const match = testId.match(/^bulk-field-(\w+)-(\d+)$/);
      if (!match) return;
      
      const field = match[1] as keyof BulkEntryRow;
      const rowIndex = parseInt(match[2], 10);
      
      if (rowIndex > 0 && rows[rowIndex - 1]) {
        const aboveValue = rows[rowIndex - 1][field];
        updateRow(rowIndex, field, aboveValue);
      }
      return;
    }
  };
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

  const handleKeyDown = createKeyHandler(rows, updateRow);

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
    onSubmit(filledRows);
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
              {selectedDate}
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
              <div className="space-y-2">
                <div className="grid grid-cols-[40px_70px_90px_90px_70px_70px_70px_60px_60px_80px_40px] gap-1 text-xs font-medium text-muted-foreground sticky top-0 bg-card/95 py-1 z-10">
                  <div>#</div>
                  <div>일자</div>
                  <div>거래처</div>
                  <div>품명</div>
                  <div>두께</div>
                  <div>권취</div>
                  <div>작업</div>
                  <div>엠보</div>
                  <div>사이즈</div>
                  <div>기타</div>
                  <div></div>
                </div>

                {rows.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[40px_70px_90px_90px_70px_70px_70px_60px_60px_80px_40px] gap-1 items-center"
                    data-testid={`bulk-row-${idx}`}
                  >
                    <div className="text-xs text-muted-foreground text-center">{idx + 1}</div>
                    <Input
                      value={row.date}
                      onChange={(e) => updateRow(idx, "date", e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="YYYY-MM-DD"
                      className="h-9 text-xs rounded-lg"
                      data-testid={`bulk-field-date-${idx}`}
                    />
                    <Input
                      value={row.counterparty}
                      onChange={(e) => updateRow(idx, "counterparty", e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="거래처"
                      className="h-9 text-xs rounded-lg"
                      data-testid={`bulk-field-counterparty-${idx}`}
                    />
                    <Input
                      value={row.productName}
                      onChange={(e) => updateRow(idx, "productName", e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="품명"
                      className="h-9 text-xs rounded-lg"
                      data-testid={`bulk-field-productName-${idx}`}
                    />
                    <Input
                      value={row.thickness}
                      onChange={(e) => updateRow(idx, "thickness", e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="두께"
                      type="number"
                      step="0.01"
                      className="h-9 text-xs rounded-lg"
                      data-testid={`bulk-field-thickness-${idx}`}
                    />
                    <Input
                      value={row.winding}
                      onChange={(e) => updateRow(idx, "winding", e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="권취"
                      type="number"
                      className="h-9 text-xs rounded-lg"
                      data-testid={`bulk-field-winding-${idx}`}
                    />
                    <Input
                      value={row.workType}
                      onChange={(e) => updateRow(idx, "workType", e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="작업"
                      className="h-9 text-xs rounded-lg"
                      data-testid={`bulk-field-workType-${idx}`}
                    />
                    <Input
                      value={row.emboss}
                      onChange={(e) => updateRow(idx, "emboss", e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="엠보"
                      className="h-9 text-xs rounded-lg"
                      data-testid={`bulk-field-emboss-${idx}`}
                    />
                    <Input
                      value={row.size}
                      onChange={(e) => updateRow(idx, "size", e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="사이즈"
                      className="h-9 text-xs rounded-lg"
                      data-testid={`bulk-field-size-${idx}`}
                    />
                    <Input
                      value={row.note}
                      onChange={(e) => updateRow(idx, "note", e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="기타"
                      className="h-9 text-xs rounded-lg"
                      data-testid={`bulk-field-note-${idx}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                      onClick={() => removeRow(idx)}
                      data-testid={`bulk-remove-row-${idx}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
