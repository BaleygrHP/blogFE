"use client";

import { ChevronUp } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "./components/Header";

type SitePage =
  | "home"
  | "editorial"
  | "notes"
  | "diary"
  | "gallery"
  | "archive"
  | "about"
  | "article";

function getCurrentPageFromPath(pathname: string): SitePage {
  if (pathname === "/") return "home";

  const seg1 = pathname.split("/").filter(Boolean)[0];
  if (!seg1) return "home";

  if (
    seg1 === "editorial" ||
    seg1 === "notes" ||
    seg1 === "diary" ||
    seg1 === "gallery" ||
    seg1 === "archive" ||
    seg1 === "about"
  ) {
    return seg1;
  }

  return "article";
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentPage = getCurrentPageFromPath(pathname);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const handleNavigate = (page: string) => {
    if (page === "home") return router.push("/");
    if (page === "admin") return router.push("/admin");
    return router.push(`/${page}`);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {currentPage !== "article" && (
        // Keep signature compatible with the original SPA Header (even if Header ignores props)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <Header {...({ currentPage, onNavigate: handleNavigate } as any)} />
      )}

      {children}

      {currentPage !== "article" && (
        <footer className="border-t border-border mt-24">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="text-center">
              <p className="text-2xl mb-2">The Daily Chronicle</p>
              <p className="meta text-muted-foreground mb-6">
                A Personal Newsroom
              </p>
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={() => handleNavigate("admin")}
                  className="meta text-muted-foreground hover:text-foreground underline transition-colors"
                >
                  Admin Login
                </button>
                <span className="text-muted-foreground">·</span>
                <a
                  href="mailto:phamngochung3032001@gmail.com"
                  className="meta text-muted-foreground hover:text-foreground underline transition-colors"
                >
                  Liên hệ
                </a>
              </div>
              <p className="meta text-muted-foreground">
                © 2025 · Được tạo ra bởi Báleygr
              </p>
            </div>
          </div>
        </footer>
      )}

      <button
        type="button"
        aria-label="Scroll to top"
        onClick={handleScrollToTop}
        className={`fixed right-6 bottom-6 z-50 inline-flex h-11 w-11 items-center justify-center border border-border bg-card text-foreground shadow-sm transition-all hover:border-foreground hover:bg-secondary ${
          showScrollTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <ChevronUp className="h-5 w-5" />
      </button>
    </div>
  );
}
