type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-12 pb-8 border-b border-border">
      <h1 className="mb-4">{title}</h1>
      {description && (
        <p className="text-lg text-muted-foreground max-w-2xl">
          {description}
        </p>
      )}
    </header>
  );
}
