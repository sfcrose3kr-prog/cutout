import * as React from "react";
import { FileSpreadsheet, ShieldAlert, Sparkles, Trash2, Upload } from "lucide-react";
import { Link } from "wouter";

import Seo from "@/components/Seo";
import Shell from "@/components/Shell";
import StatPill from "@/components/StatPill";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

import { useImportDayEntriesExcel } from "@/hooks/use-day-entries";

export default function ImportExcel() {
  const { toast } = useToast();
  const importMut = useImportDayEntriesExcel();

  const [replaceAll, setReplaceAll] = React.useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = React.useState<boolean>(false);

  return (
    <Shell
      rightSlot={
        <Link href="/" className="no-underline">
          <Button variant="secondary" className="rounded-xl" data-testid="import-back">
            돌아가기
          </Button>
        </Link>
      }
    >
      <Seo title="엑셀 가져오기" description="서버에 첨부된 엑셀 파일을 불러와 재단현황 데이터로 가져옵니다." />

      <div className="animate-in-up">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl">엑셀 가져오기</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              서버에 있는 엑셀 파일을 읽어 재단현황으로 변환합니다. (열 매핑: 일자/거래처/품명/두께/권취/작업/엠보/사이즈/기타)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/" className="no-underline">
              <Button variant="secondary" className="rounded-xl" data-testid="import-home">
                홈
              </Button>
            </Link>
            <Button
              className="rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              data-testid="import-run"
              onClick={() => setConfirmOpen(true)}
              disabled={importMut.isPending}
            >
              <Upload className="mr-2 h-4 w-4" />
              {importMut.isPending ? "가져오는 중..." : "가져오기 실행"}
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Card className="glass rounded-3xl p-6 lg:col-span-7">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-3xl bg-primary/10 text-primary">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-lg font-semibold tracking-tight">가져오기 옵션</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  기본은 <span className="font-medium">추가(스킵 포함)</span> 방식입니다.
                  필요 시 전체 데이터를 교체할 수 있어요.
                </div>
              </div>
            </div>

            <Separator className="my-5 opacity-60" />

            <div className="flex flex-col gap-4">
              <div className="rounded-3xl border border-border/70 bg-background/45 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-2xl bg-destructive/10 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold tracking-tight">기존 데이터 전체 교체</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        replaceAll=true로 가져오면 서버에서 기존 레코드를 삭제 후 재삽입할 수 있습니다.
                      </div>
                    </div>
                  </div>
                  <Switch
                    data-testid="replaceAll-switch"
                    checked={replaceAll}
                    onCheckedChange={(v) => setReplaceAll(v)}
                  />
                </div>

                {replaceAll ? (
                  <div className="mt-4 flex items-start gap-3 rounded-2xl border border-destructive/25 bg-destructive/5 p-4">
                    <ShieldAlert className="mt-0.5 h-4 w-4 text-destructive" />
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">주의:</span>{" "}
                      전체 교체는 되돌릴 수 없습니다. 실행 전에 확인하세요.
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="rounded-3xl border border-border/70 bg-background/45 p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-2xl bg-accent/10 text-accent">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold tracking-tight">실행</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      버튼을 누르면 서버에서 엑셀 파일을 읽어 변환/저장합니다.
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button
                    data-testid="import-run-secondary"
                    onClick={() => setConfirmOpen(true)}
                    disabled={importMut.isPending}
                    className="h-11 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {importMut.isPending ? "가져오는 중..." : "가져오기 실행"}
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    {replaceAll ? "전체 교체 모드" : "추가(스킵 포함) 모드"}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="glass rounded-3xl p-6 lg:col-span-5">
            <div className="text-sm font-semibold tracking-tight">최근 결과</div>
            <div className="mt-1 text-xs text-muted-foreground" data-testid="import-hint">
              실행하면 삽입/스킵/오류 건수가 여기에 표시됩니다.
            </div>

            <Separator className="my-5 opacity-60" />

            {importMut.isIdle ? (
              <div className="rounded-3xl border border-border/70 bg-background/45 p-8 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-3xl bg-primary/10 text-primary">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div className="mt-4 text-base font-semibold tracking-tight">아직 실행 전</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  가져오기 실행 후 결과가 표시됩니다.
                </div>
              </div>
            ) : importMut.isPending ? (
              <div className="rounded-3xl border border-border/70 bg-background/45 p-8 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                <div className="mt-4 text-base font-semibold tracking-tight">처리 중...</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  엑셀을 읽고 변환하는 중입니다.
                </div>
              </div>
            ) : importMut.isError ? (
              <div className="rounded-3xl border border-border/70 bg-background/45 p-8 text-center">
                <div className="text-base font-semibold tracking-tight">실패</div>
                <div className="mt-2 text-sm text-muted-foreground" data-testid="import-error">
                  {(importMut.error as Error).message}
                </div>
                <div className="mt-4">
                  <Button
                    variant="secondary"
                    className="rounded-xl"
                    data-testid="import-retry"
                    onClick={() => setConfirmOpen(true)}
                  >
                    다시 실행
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3" data-testid="import-result">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <StatPill label="삽입" value={importMut.data?.inserted ?? 0} tone="primary" data-testid="import-inserted" />
                  <StatPill label="스킵" value={importMut.data?.skipped ?? 0} tone="muted" data-testid="import-skipped" />
                  <StatPill label="오류" value={importMut.data?.errors?.length ?? 0} tone="accent" data-testid="import-errors" />
                </div>

                <div className="rounded-3xl border border-border/70 bg-background/45 p-4">
                  <div className="text-sm font-semibold tracking-tight">오류 상세</div>
                  <div className="mt-2 space-y-2">
                    {(importMut.data?.errors ?? []).length === 0 ? (
                      <div className="text-sm text-muted-foreground">오류 없음</div>
                    ) : (
                      importMut.data!.errors.slice(0, 8).map((e, idx) => (
                        <div
                          key={`${e.row}-${idx}`}
                          className="rounded-2xl border border-border/70 bg-card/60 px-3 py-2 text-sm"
                          data-testid={`import-error-row-${e.row}`}
                        >
                          <span className="font-medium">Row {e.row}</span>{" "}
                          <span className="text-muted-foreground">{e.message}</span>
                        </div>
                      ))
                    )}
                    {(importMut.data?.errors ?? []).length > 8 ? (
                      <div className="text-xs text-muted-foreground">
                        ... 그리고 {(importMut.data!.errors.length - 8)}건 더
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={replaceAll ? "전체 교체로 가져오기" : "엑셀 가져오기 실행"}
        description={
          replaceAll
            ? "기존 데이터를 모두 교체합니다. 정말 실행할까요?"
            : "서버의 엑셀 파일을 읽어 새로운 항목을 삽입합니다. 실행할까요?"
        }
        confirmText="실행"
        destructive={replaceAll}
        isPending={importMut.isPending}
        data-testid="import-confirm"
        onConfirm={async () => {
          try {
            const result = await importMut.mutateAsync({ replaceAll });
            toast({
              title: "가져오기 완료",
              description: `삽입 ${result.inserted} · 스킵 ${result.skipped} · 오류 ${result.errors.length}`,
            });
            setConfirmOpen(false);
          } catch (e) {
            toast({
              title: "가져오기 실패",
              description: (e as Error).message,
              variant: "destructive",
            });
          }
        }}
      />
    </Shell>
  );
}
