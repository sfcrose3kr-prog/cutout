import * as React from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar as CalendarIcon, Plus, RefreshCw, Search, SlidersHorizontal, ListPlus } from "lucide-react";

import Seo from "@/components/Seo";
import Shell from "@/components/Shell";
import StatPill from "@/components/StatPill";
import EntriesTable from "@/components/EntriesTable";
import EntryFormDialog, { type DayEntryFormValues } from "@/components/EntryFormDialog";
import BulkEntryFormDialog, { type BulkEntryRow } from "@/components/BulkEntryFormDialog";
import ConfirmDialog from "@/components/ConfirmDialog";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

import type { DayEntryResponse } from "@shared/routes";
import {
  useCreateDayEntry,
  useDayEntries,
  useDeleteDayEntry,
  useUpdateDayEntry,
  useBulkCreateDayEntries,
} from "@/hooks/use-day-entries";

function toYmd(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function prettyKoreanDate(ymd: string) {
  const [y, m, da] = ymd.split("-").map((v) => Number(v));
  const d = new Date(y, (m ?? 1) - 1, da ?? 1);
  return format(d, "PPP (EEE)", { locale: ko });
}

type ViewMode = "daily" | "monthly" | "range";

export default function Home() {
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = React.useState<string>(toYmd(new Date()));
  const [selectedMonth, setSelectedMonth] = React.useState<Date>(new Date());
  const [rangeFrom, setRangeFrom] = React.useState<string>("");
  const [rangeTo, setRangeTo] = React.useState<string>("");
  const [counterparty, setCounterparty] = React.useState<string>("");
  const [q, setQ] = React.useState<string>("");
  const [viewMode, setViewMode] = React.useState<ViewMode>("monthly");

  const filters = React.useMemo(() => {
    if (viewMode === "range") {
      return {
        from: rangeFrom || undefined,
        to: rangeTo || undefined,
        counterparty: counterparty || undefined,
        q: q || undefined,
      };
    }
    if (viewMode === "monthly") {
      const monthStart = format(startOfMonth(selectedMonth), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(selectedMonth), "yyyy-MM-dd");
      return {
        from: monthStart,
        to: monthEnd,
        counterparty: counterparty || undefined,
        q: q || undefined,
      };
    }
    return {
      date: selectedDate,
      counterparty: counterparty || undefined,
      q: q || undefined,
    };
  }, [viewMode, selectedDate, selectedMonth, rangeFrom, rangeTo, counterparty, q]);

  const list = useDayEntries(filters);

  const createMut = useCreateDayEntry();
  const updateMut = useUpdateDayEntry();
  const deleteMut = useDeleteDayEntry();
  const bulkCreateMut = useBulkCreateDayEntries();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [bulkOpen, setBulkOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<DayEntryResponse | null>(null);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<DayEntryResponse | null>(null);

  const items = list.data ?? [];

  const totalWinding = React.useMemo(() => {
    return items.reduce((sum, it) => sum + (Number(it.winding) || 0), 0);
  }, [items]);

  const uniqueCounterparties = React.useMemo(() => {
    const s = new Set<string>();
    items.forEach((it) => it.counterparty && s.add(it.counterparty));
    return s.size;
  }, [items]);

  const headerRight = (
    <div className="flex gap-2">
      <Button
        data-testid="header-bulk-entry"
        onClick={() => setBulkOpen(true)}
        variant="secondary"
        className="rounded-xl"
      >
        <ListPlus className="mr-2 h-4 w-4" />
        10개 입력
      </Button>
      <Button
        data-testid="header-new-entry"
        onClick={() => setCreateOpen(true)}
        className="rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
      >
        <Plus className="mr-2 h-4 w-4" />
        새 입력
      </Button>
    </div>
  );

  return (
    <Shell rightSlot={headerRight}>
      <Seo title="재단1호기 재단현황" description="캘린더로 날짜를 선택하고 거래처/품명 등 작업 정보를 일자별로 빠르게 입력·조회하세요." />

      <div className="animate-in-up">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl">재단1호기 재단현황</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              날짜를 중심으로 빠르게 입력하고, 거래처/키워드로 즉시 필터링하세요.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl border border-border/70 bg-background/60 p-1">
              <Button
                variant={viewMode === "daily" ? "default" : "ghost"}
                size="sm"
                className="rounded-lg"
                data-testid="view-daily"
                onClick={() => setViewMode("daily")}
              >
                일별
              </Button>
              <Button
                variant={viewMode === "monthly" ? "default" : "ghost"}
                size="sm"
                className="rounded-lg"
                data-testid="view-monthly"
                onClick={() => setViewMode("monthly")}
              >
                월별
              </Button>
              <Button
                variant={viewMode === "range" ? "default" : "ghost"}
                size="sm"
                className="rounded-lg"
                data-testid="view-range"
                onClick={() => setViewMode("range")}
              >
                기간
              </Button>
            </div>
            <Button
              variant="secondary"
              className="rounded-xl"
              data-testid="refresh"
              onClick={() => list.refetch()}
              disabled={list.isFetching}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${list.isFetching ? "animate-spin" : ""}`} />
              새로고침
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Card className="glass rounded-3xl p-5 lg:col-span-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <CalendarIcon className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-sm font-semibold tracking-tight">
                    {viewMode === "daily" ? "날짜 선택" : viewMode === "monthly" ? "월 선택" : "기간 검색"}
                  </div>
                  <div className="text-xs text-muted-foreground" data-testid="selected-date-label">
                    {viewMode === "daily"
                      ? prettyKoreanDate(selectedDate)
                      : viewMode === "monthly"
                        ? format(selectedMonth, "yyyy년 M월", { locale: ko })
                        : rangeFrom && rangeTo
                          ? `${rangeFrom} ~ ${rangeTo}`
                          : "기간을 선택하세요"}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setBulkOpen(true)}
                  data-testid="bulk-entry-button"
                  variant="secondary"
                  className="rounded-xl"
                >
                  <ListPlus className="mr-2 h-4 w-4" />
                  10개
                </Button>
                <Button
                  onClick={() => setCreateOpen(true)}
                  data-testid="new-entry-button"
                  className="rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  새 입력
                </Button>
              </div>
            </div>

            <Separator className="my-4 opacity-60" />

            {viewMode === "daily" && (
              <div data-testid="calendar">
                <Calendar
                  mode="single"
                  selected={new Date(selectedDate)}
                  onSelect={(d) => {
                    if (!d) return;
                    setSelectedDate(toYmd(d));
                  }}
                  className="rounded-2xl border border-border/70 bg-background/40 p-3"
                />
              </div>
            )}

            {viewMode === "monthly" && (
              <div data-testid="month-selector" className="rounded-2xl border border-border/70 bg-background/40 p-4">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                    data-testid="prev-month"
                  >
                    이전
                  </Button>
                  <div className="text-lg font-semibold" data-testid="current-month">
                    {format(selectedMonth, "yyyy년 M월", { locale: ko })}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                    data-testid="next-month"
                  >
                    다음
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <Button
                      key={month}
                      variant={selectedMonth.getMonth() + 1 === month && selectedMonth.getFullYear() === new Date().getFullYear() ? "default" : "outline"}
                      size="sm"
                      className="rounded-lg"
                      onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), month - 1, 1))}
                      data-testid={`month-${month}`}
                    >
                      {month}월
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {viewMode === "range" && (
              <div data-testid="range-selector" className="rounded-2xl border border-border/70 bg-background/40 p-4 space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">시작일</label>
                  <Input
                    type="date"
                    value={rangeFrom}
                    onChange={(e) => setRangeFrom(e.target.value)}
                    className="rounded-lg"
                    data-testid="range-from"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">종료일</label>
                  <Input
                    type="date"
                    value={rangeTo}
                    onChange={(e) => setRangeTo(e.target.value)}
                    className="rounded-lg"
                    data-testid="range-to"
                  />
                </div>
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatPill data-testid="stat-count" label="건수" value={items.length} tone="primary" />
              <StatPill data-testid="stat-winding" label="권취 합계" value={totalWinding} tone="accent" />
              <StatPill data-testid="stat-counterparty" label="거래처" value={uniqueCounterparties} tone="muted" />
            </div>
          </Card>

          <div className="lg:col-span-8">
            <Card className="glass rounded-3xl p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-semibold tracking-tight">검색/필터</div>
                  <div className="text-xs text-muted-foreground">
                    거래처 또는 키워드로 빠르게 좁혀보세요.
                  </div>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <div className="relative w-full sm:w-[240px]">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      data-testid="filter-q"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="품명/기타/작업 키워드"
                      className="h-11 rounded-xl bg-background/70 pl-9"
                    />
                  </div>
                  <Input
                    data-testid="filter-counterparty"
                    value={counterparty}
                    onChange={(e) => setCounterparty(e.target.value)}
                    placeholder="거래처"
                    className="h-11 rounded-xl bg-background/70 sm:w-[180px]"
                  />
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-border/70 bg-background/40 p-4">
                <div className="text-xs text-muted-foreground">현재 조회</div>
                <div className="mt-1 text-base font-semibold tracking-tight" data-testid="current-mode">
                  {viewMode === "daily"
                    ? `${selectedDate} (일별)`
                    : viewMode === "monthly"
                      ? `${format(selectedMonth, "yyyy년 M월", { locale: ko })} (월별)`
                      : rangeFrom && rangeTo
                        ? `${rangeFrom} ~ ${rangeTo} (기간)`
                        : "기간을 선택하세요"}
                </div>
              </div>

              <Separator className="my-5 opacity-60" />

              {list.isLoading ? (
                <div className="rounded-3xl border border-border/70 bg-card/70 p-10 text-center shadow-soft">
                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                  <div className="mt-4 text-sm font-medium">불러오는 중...</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    최신 데이터를 가져오고 있어요
                  </div>
                </div>
              ) : list.error ? (
                <div className="rounded-3xl border border-border/70 bg-card/70 p-10 text-center shadow-soft">
                  <div className="text-base font-semibold tracking-tight">문제가 발생했어요</div>
                  <div className="mt-2 text-sm text-muted-foreground" data-testid="list-error">
                    {(list.error as Error).message}
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="secondary"
                      className="rounded-xl"
                      data-testid="retry"
                      onClick={() => list.refetch()}
                    >
                      다시 시도
                    </Button>
                  </div>
                </div>
              ) : (
                <EntriesTable
                  items={items}
                  onEdit={(e) => {
                    setEditing(e);
                    setEditOpen(true);
                  }}
                  onDelete={(e) => {
                    setDeleting(e);
                    setDeleteOpen(true);
                  }}
                  isDeletingId={deleteMut.isPending ? deleting?.id ?? null : null}
                />
              )}
            </Card>
          </div>
        </div>
      </div>

      <EntryFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        selectedDate={selectedDate}
        onSubmit={async (values: DayEntryFormValues) => {
          try {
            await createMut.mutateAsync(values);
            toast({ title: "저장 완료", description: "새 입력이 추가되었습니다." });
            setCreateOpen(false);
          } catch (e) {
            toast({
              title: "저장 실패",
              description: (e as Error).message,
              variant: "destructive",
            });
          }
        }}
        isPending={createMut.isPending}
      />

      <EntryFormDialog
        mode="edit"
        open={editOpen}
        onOpenChange={(v) => {
          setEditOpen(v);
          if (!v) setEditing(null);
        }}
        selectedDate={selectedDate}
        entry={editing}
        onSubmit={async (values: DayEntryFormValues) => {
          if (!editing) return;
          try {
            await updateMut.mutateAsync({ id: editing.id, ...values });
            toast({ title: "수정 완료", description: "입력이 업데이트되었습니다." });
            setEditOpen(false);
            setEditing(null);
          } catch (e) {
            toast({
              title: "수정 실패",
              description: (e as Error).message,
              variant: "destructive",
            });
          }
        }}
        isPending={updateMut.isPending}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(v) => {
          setDeleteOpen(v);
          if (!v) setDeleting(null);
        }}
        title="정말 삭제할까요?"
        description={
          deleting
            ? `거래처 "${deleting.counterparty}" · 품명 "${deleting.productName}" 항목을 삭제합니다.`
            : undefined
        }
        confirmText="삭제"
        destructive
        isPending={deleteMut.isPending}
        data-testid="delete-confirm"
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await deleteMut.mutateAsync(deleting.id);
            toast({ title: "삭제 완료", description: "항목이 삭제되었습니다." });
            setDeleteOpen(false);
            setDeleting(null);
          } catch (e) {
            toast({
              title: "삭제 실패",
              description: (e as Error).message,
              variant: "destructive",
            });
          }
        }}
      />

      <BulkEntryFormDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        selectedDate={selectedDate}
        onSubmit={async (rows: BulkEntryRow[]) => {
          try {
            const entries = rows.map((r) => ({
              date: r.date,
              counterparty: r.counterparty,
              productName: r.productName,
              thickness: parseFloat(r.thickness),
              winding: parseInt(r.winding, 10),
              workType: r.workType,
              emboss: r.emboss,
              size: r.size,
              note: r.note || null,
            }));
            const result = await bulkCreateMut.mutateAsync(entries);
            toast({
              title: "일괄 저장 완료",
              description: `${result.inserted}건이 추가되었습니다.`,
            });
            setBulkOpen(false);
          } catch (e) {
            toast({
              title: "저장 실패",
              description: (e as Error).message,
              variant: "destructive",
            });
          }
        }}
        isPending={bulkCreateMut.isPending}
      />
    </Shell>
  );
}
