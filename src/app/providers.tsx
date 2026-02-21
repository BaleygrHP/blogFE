"use client";
import * as React from "react";
import { ThemeProvider } from "next-themes";
import { GlobalLoadingOverlay } from "./components/GlobalLoadingOverlay";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <GlobalLoadingOverlay />
    </ThemeProvider>
  );
}
