export function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Page Header */}
      <header className="mb-12 pb-8 border-b border-border">
        <h1 className="mb-4">About</h1>
      </header>

      {/* Content */}
      <div className="prose">
        <p>
          <strong>The Daily Chronicle</strong> is a personal newsroom—a space for thinking through 
          ideas about design, technology, and thoughtful work.
        </p>

        <p>
          This site follows the principles of quiet UI design: text-first, minimal distractions, 
          and respect for the reader&apos;s attention. The design isn&apos;t meant to be invisible, 
          but it shouldn&apos;t compete with the content.
        </p>

        <h2>Structure</h2>

        <p>
          Content is organized into three main sections:
        </p>

        <p>
          <strong>Editorial</strong> contains opinion pieces and commentary. These are perspectives, 
          not instructions. They represent one way of thinking about problems—not the only way.
        </p>

        <p>
          <strong>Notes</strong> are longer explorations of tools, techniques, and practices. 
          More structured than diary entries, but less opinionated than editorials.
        </p>

        <p>
          <strong>Diary</strong> contains brief, personal observations. Thoughts in progress, 
          half-formed ideas, and quiet reflections. This is where work happens in public.
        </p>

        <h2>Principles</h2>

        <p>
          This site is built on a few core beliefs:
        </p>

        <ul>
          <li>Text is primary. Images support reading, they don&apos;t replace it.</li>
          <li>Design should be calm, not attention-seeking.</li>
          <li>Features should justify their existence.</li>
          <li>Constraints enable creativity.</li>
        </ul>

        <h2>Contact</h2>

        <p>
          Questions, thoughts, or just want to say hello? Reach out at{' '}
          <a 
            href="mailto:editor@dailychronicle.com"
            className="underline hover:text-muted-foreground transition-colors"
          >
            editor@dailychronicle.com
          </a>
        </p>

        {/* Closing marker */}
        <div className="mt-16 pt-8 border-t border-border text-center">
          <span className="text-2xl text-muted-foreground">◆</span>
        </div>
      </div>
    </div>
  );
}
