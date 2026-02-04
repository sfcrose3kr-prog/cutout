import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { DayEntryResponse } from "@shared/routes";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function EntriesTable({
  items,
  onEdit,
  onDelete,
  isDeletingId,
}: {
  items: DayEntryResponse[];
  onEdit: (entry: DayEntryResponse) => void;
  onDelete: (entry: DayEntryResponse) => void;
  isDeletingId?: number | null;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border/70 bg-card/80 backdrop-blur-xl",
        "shadow-[var(--shadow-lg)] overflow-hidden",
      )}
      data-testid="entries-table"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
        <div>
          <div className="text-sm font-semibold tracking-tight">입력 목록</div>
          <div className="text-xs text-muted-foreground">
            항목을 수정/삭제할 수 있어요.
          </div>
        </div>
        <div
          className="rounded-2xl border border-border/70 bg-background/60 px-3 py-1.5 text-xs text-muted-foreground"
          data-testid="entries-count"
        >
          {items.length}건
        </div>
      </div>

      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="min-w-[100px]">일자</TableHead>
              <TableHead className="min-w-[110px]">거래처</TableHead>
              <TableHead className="min-w-[120px]">품명</TableHead>
              <TableHead className="min-w-[80px] text-right">두께</TableHead>
              <TableHead className="min-w-[80px] text-right">권취</TableHead>
              <TableHead className="min-w-[90px]">작업</TableHead>
              <TableHead className="min-w-[90px]">엠보</TableHead>
              <TableHead className="min-w-[80px] text-right">사이즈</TableHead>
              <TableHead className="min-w-[180px]">기타</TableHead>
              <TableHead className="w-[120px] text-right">작업</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((it) => (
              <TableRow
                key={it.id}
                data-testid={`entry-row-${it.id}`}
                className="transition-colors hover:bg-secondary/50"
              >
                <TableCell className="tabular-nums">{it.date}</TableCell>
                <TableCell className="font-medium">{it.counterparty}</TableCell>
                <TableCell>{it.productName}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {Number(it.thickness).toFixed(2)}
                </TableCell>
                <TableCell className="text-right tabular-nums">{it.winding}</TableCell>
                <TableCell>{it.workType}</TableCell>
                <TableCell>{it.emboss}</TableCell>
                <TableCell className="text-right tabular-nums">{it.size}</TableCell>
                <TableCell className="text-muted-foreground">
                  {it.note || <span className="opacity-50">—</span>}
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-9 rounded-xl"
                      data-testid={`entry-edit-${it.id}`}
                      onClick={() => onEdit(it)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      수정
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-9 rounded-xl"
                      data-testid={`entry-delete-${it.id}`}
                      onClick={() => onDelete(it)}
                      disabled={isDeletingId === it.id}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeletingId === it.id ? "삭제 중..." : "삭제"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="py-14 text-center">
                  <div className="mx-auto flex max-w-md flex-col items-center gap-2">
                    <div className="text-base font-semibold tracking-tight">
                      아직 입력이 없어요
                    </div>
                    <div className="text-sm text-muted-foreground">
                      상단의 <span className="font-medium">새 입력</span> 버튼으로
                      시작해보세요.
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
