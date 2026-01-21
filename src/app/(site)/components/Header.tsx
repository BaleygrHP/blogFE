import Link from "next/link";

export function Header() {
  const sections = [
    { label: "Editorial", href: "/editorial" },
    { label: "Notes", href: "/notes" },
    { label: "Diary", href: "/diary" },
    { label: "Gallery", href: "/gallery" },
    { label: "Archive", href: "/archive" },
    { label: "About", href: "/about" },
  ];

  return (
    <header className="border-b border-border bg-background">
      <div className="max-w-6xl mx-auto px-6">
        {/* Site Title */}
        <div className="py-8 md:py-12 text-center border-b border-border">
          <Link href="/" className="inline-block hover:opacity-70 transition-opacity">
            <h1 className="text-4xl md:text-5xl tracking-tight">The Daily Chronicle</h1>
          </Link>
          <h2>Biên niên sử của Hưng</h2>
          <p className="meta mt-2">A Personal Newsroom - hồi kí của 1 rân chơi</p>
        </div>

        {/* Navigation */}
        <nav className="flex items-center justify-center gap-8 py-4 flex-wrap">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="section-label text-muted-foreground hover:text-foreground transition-colors"
            >
              {s.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
