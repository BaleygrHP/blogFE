"use client";

import { usePathname, useRouter } from "next/navigation";
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

  const handleNavigate = (page: string) => {
    if (page === "home") return router.push("/");
    if (page === "admin") return router.push("/admin");
    return router.push(`/${page}`);
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
                  href="mailto:editor@dailychronicle.com"
                  className="meta text-muted-foreground hover:text-foreground underline transition-colors"
                >
                  Liên hệ
                </a>
              </div>
              <p className="meta text-muted-foreground">
                © 2025 · Built with quiet UI principles
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
