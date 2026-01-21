import "@/app/styles/globals.css";
// Keep the original page.tsx styling (Tailwind build + project styles)
import "@/app/styles/index.css";
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
