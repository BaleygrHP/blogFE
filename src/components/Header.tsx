interface HeaderProps {
  currentPage?: string;
  onNavigate: (page: string) => void;
}

export function Header({ currentPage = 'home', onNavigate }: HeaderProps) {
  const sections = ['Editorial', 'Notes', 'Diary', 'Archive', 'About'];

  return (
    <header className="border-b border-border bg-background">
      <div className="max-w-6xl mx-auto px-6">
        {/* Site Title */}
        <div className="py-8 md:py-12 text-center border-b border-border">
          <button 
            onClick={() => onNavigate('home')}
            className="hover:opacity-70 transition-opacity"
          >
            <h1 className="text-4xl md:text-5xl tracking-tight">
              The Daily Chronicle
            </h1>
          </button>
          <p className="meta mt-2">A Personal Newsroom</p>
        </div>

        {/* Navigation */}
        <nav className="flex items-center justify-center gap-8 py-4">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => onNavigate(section.toLowerCase())}
              className={`section-label transition-colors hover:text-foreground ${
                currentPage === section.toLowerCase()
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {section}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
