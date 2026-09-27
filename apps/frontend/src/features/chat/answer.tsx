"use client";

import type { Citation } from "@/lib/api/types";
import { cn } from "@/lib/format";

export function citationLabel(citation: Citation) {
  return citation.page ? `${citation.documentName}, page ${citation.page}` : citation.documentName;
}

export function CitationMarker({
  citation,
  active,
  onSelect,
}: {
  citation: Citation;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Source ${citation.index}: ${citationLabel(citation)}`}
      aria-pressed={active}
      className={cn(
        "ml-0.5 inline-grid h-[1.35em] min-w-[1.35em] place-items-center rounded px-1 align-[0.15em] font-sans text-[0.65em] leading-none font-semibold tabular-nums transition-colors",
        active ? "bg-accent text-accent-ink" : "bg-accent-soft text-accent hover:bg-accent/20",
      )}
    >
      {citation.index}
    </button>
  );
}

/** Renders answer text, turning [n] markers into buttons that open the matching source. */
export function Answer({
  content,
  citations,
  activeIndex,
  onCite,
  streaming = false,
}: {
  content: string;
  citations: Citation[];
  activeIndex: number | null;
  onCite: (index: number) => void;
  streaming?: boolean;
}) {
  const paragraphs = content.split(/\n{2,}/);

  // A marker stays on the same line as the word before it and the punctuation after it.
  const renderParagraph = (paragraph: string) => {
    const nodes: React.ReactNode[] = [];
    let last = 0;
    for (const match of paragraph.matchAll(/(\S+)\s*\[(\d+)\]([.,;:!?)]*)/g)) {
      const [whole, word, number, punctuation] = match;
      const citation = citations.find((c) => c.index === Number(number));
      if (!citation) continue;
      nodes.push(paragraph.slice(last, match.index));
      nodes.push(
        <span key={match.index} className="whitespace-nowrap">
          {word}
          <CitationMarker
            citation={citation}
            active={activeIndex === citation.index}
            onSelect={() => onCite(citation.index)}
          />
          {punctuation}
        </span>,
      );
      last = match.index + whole.length;
    }
    nodes.push(paragraph.slice(last));
    return nodes;
  };

  return (
    <div className="font-serif text-[1.1875rem] leading-[1.65] text-pretty">
      {paragraphs.map((paragraph, p) => (
        <p key={p} className="mb-4 last:mb-0">
          {renderParagraph(paragraph)}
          {streaming && p === paragraphs.length - 1 && (
            <span
              aria-hidden
              className="ml-0.5 inline-block h-[1em] w-[2px] animate-pulse bg-ink/70 align-[-0.15em]"
            />
          )}
        </p>
      ))}
    </div>
  );
}

/** Compact list of an answer's sources, shown under it. */
export function SourceList({
  citations,
  activeIndex,
  onCite,
}: {
  citations: Citation[];
  activeIndex: number | null;
  onCite: (index: number) => void;
}) {
  if (citations.length === 0) return null;
  return (
    <ul className="mt-5 flex flex-wrap gap-2" aria-label="Sources">
      {citations.map((citation) => (
        <li key={citation.index}>
          <button
            type="button"
            onClick={() => onCite(citation.index)}
            aria-pressed={activeIndex === citation.index}
            className={cn(
              "flex max-w-full items-center gap-2 rounded-md border py-1 pr-2.5 pl-1 text-left text-sm transition-colors",
              activeIndex === citation.index
                ? "border-accent bg-accent-soft"
                : "border-line hover:bg-sunken",
            )}
          >
            <span className="grid h-5 min-w-5 place-items-center rounded bg-accent-soft px-1 text-xs font-semibold text-accent tabular-nums">
              {citation.index}
            </span>
            <span className="truncate">{citation.documentName}</span>
            {citation.page && <span className="shrink-0 text-muted">p. {citation.page}</span>}
          </button>
        </li>
      ))}
    </ul>
  );
}
