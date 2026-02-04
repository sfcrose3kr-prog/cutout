import { PropsWithChildren, useContext } from "react";
import { Link, useLocation } from "wouter";
import { CalendarDays, FileSpreadsheet, LayoutGrid, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/App";

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "grid h-10 w-10 place-items-center rounded-2xl",
          "bg-gradient-to-br from-primary/15 to-accent/15",
          "border border-border shadow-soft",
        )}
        aria-hidden
      >
        <CalendarDays className="h-5 w-5 text-primary" />
      </div>
      <div className="leading-tight">
        <div className="text-[15px] font-semibold tracking-tight">
          일자별 작업 입력
        </div>
        <div className="text-xs text-muted-foreground">
          날짜 기반 생산/거래 입력 시스템
        </div>
      </div>
    </div>
  );
}

export default function Shell({
  children,
  rightSlot,
}: PropsWithChildren<{ rightSlot?: React.ReactNode }>) {
  const [loc] = useLocation();
  const { isAdmin, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-mesh grain">
      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/70 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between gap-4">
              <Link href="/" className="group flex items-center gap-3">
                <Brand />
              </Link>

              <nav className="hidden items-center gap-2 md:flex" aria-label="Primary">
                <Link
                  href="/"
                  data-testid="nav-home"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium",
                    "transition-all duration-200",
                    "hover:bg-secondary/70 hover:shadow-soft",
                    loc === "/" && "bg-secondary shadow-soft",
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                  홈
                </Link>
                {isAdmin && (
                  <Link
                    href="/import"
                    data-testid="nav-import"
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium",
                      "transition-all duration-200",
                      "hover:bg-secondary/70 hover:shadow-soft",
                      loc === "/import" && "bg-secondary shadow-soft",
                    )}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    엑셀 가져오기
                  </Link>
                )}
              </nav>

              <div className="flex items-center gap-2">
                <div className="hidden sm:block">{rightSlot}</div>
                {isAdmin && (
                  <div className="md:hidden">
                    <Link href="/import" className="no-underline">
                      <Button
                        variant="secondary"
                        size="sm"
                        data-testid="mobile-import"
                        className="rounded-xl"
                      >
                        가져오기
                      </Button>
                    </Link>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  data-testid="logout-button"
                  className="rounded-xl"
                  title="로그아웃"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
          {children}
        </main>

        <footer className="border-t border-border/60 bg-background/60 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div>© {new Date().getFullYear()} Day Entries</div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary/70" />
                빠른 입력 · 즉시 검색 · 날짜 중심
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
