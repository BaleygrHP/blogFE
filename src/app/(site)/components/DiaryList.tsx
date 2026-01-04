import { DiaryEntry } from "@/lib/types";

interface DiaryListProps {
  entries: DiaryEntry[];
  onReadEntry: (slug: string) => void;
}

export function DiaryList({ entries, onReadEntry }: DiaryListProps) {
  return (
    <section className="mb-16">
      <h3 className="text-2xl mb-8 pb-3 border-b border-border">
        Nhật ký
      </h3>
      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            onClick={() => onReadEntry(entry.slug)}
            className="flex items-baseline justify-between gap-4 py-2 cursor-pointer group hover:bg-secondary transition-colors px-3 -mx-3"
          >
            <h4 className="text-lg group-hover:opacity-70 transition-opacity flex-1">
              {entry.title}
            </h4>
            <span className="meta text-muted-foreground whitespace-nowrap">
              {entry.date}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
