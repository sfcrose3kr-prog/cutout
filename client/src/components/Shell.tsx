import { PropsWithChildren, useContext } from "react";
import { Link, useLocation } from "wouter";
import { CalendarDays, LayoutGrid, LogOut } from "lucide-react";
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
              </nav>

              <div className="flex items-center gap-2">
                <div className="hidden sm:block">{rightSlot}</div>
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
          <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-muted-foreground text-center sm:px-6 lg:px-8">
            <div>2026년에 만들었습니다</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
