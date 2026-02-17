import Link from "next/link";

export function Header() {
  const sections = [
    { label: "Biên tập", href: "/editorial" },
    { label: "Ghi chú", href: "/notes" },
    { label: "Nhật ký", href: "/diary" },
    { label: "Thư viện", href: "/gallery" },
    { label: "Lưu trữ", href: "/archive" },
    { label: "Giới thiệu", href: "/about" },
  ];

  return (
    <header className="border-b border-border bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="py-8 md:py-12 text-center border-b border-border">
          <Link href="/" className="inline-block hover:opacity-70 transition-opacity">
            <h1 className="text-4xl md:text-5xl tracking-tight">The Daily Chronicle</h1>
          </Link>
          <h2>Biên niên sử của Hưng</h2>
          <p className="meta mt-2">Tòa soạn cá nhân - hồi ký của một dân chơi</p>
        </div>

        <nav className="flex items-center justify-center gap-8 py-4 flex-wrap">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="section-label text-muted-foreground hover:text-foreground transition-colors"
            >
              {section.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
