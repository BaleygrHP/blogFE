import "@/app/styles/globals.css";
import { Inter, Lora } from "next/font/google";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
});

const lora = Lora({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600"],
  style: ["normal"],
  display: "swap",
  preload: true,
  variable: "--font-lora",
});

const loraItalic = Lora({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400"],
  style: ["italic"],
  display: "swap",
  preload: true,
  variable: "--font-lora-italic",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${inter.variable} ${lora.variable} ${loraItalic.variable}`}
    >
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
