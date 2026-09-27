"use client";

import { FileText, X } from "lucide-react";
import { useEffect, useRef } from "react";

import type { Citation } from "@/lib/api/types";
import { cn } from "@/lib/format";

/** The passage, with the part the answer relied on marked like a highlighter pen. */
function Excerpt({ citation, highlighted }: { citation: Citation; highlighted: boolean }) {
  const start = highlighted ? citation.excerpt.indexOf(citation.quote) : -1;
  if (start === -1) return <>{citation.excerpt}</>;
  const end = start + citation.quote.length;
  return (
    <>
      {citation.excerpt.slice(0, start)}
      <mark className="rounded-xs bg-mark box-decoration-clone px-0.5 text-mark-ink">
        {citation.excerpt.slice(start, end)}
      </mark>
      {citation.excerpt.slice(end)}
    </>
  );
}

export function SourcesPanel({
  citations,
  activeIndex,
  onSelect,
  onClose,
}: {
  citations: Citation[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}) {
  const activeRef = useRef<HTMLLIElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  useEffect(() => {
    // As an overlay (below the lg breakpoint) the panel takes focus; beside the thread it doesn't.
    if (window.matchMedia("(width < 64rem)").matches) closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <>
      {/* Below lg the panel floats over the thread. */}
      <button
        type="button"
        aria-label="Close sources"
        onClick={onClose}
        className="fixed inset-0 z-30 bg-black/30 lg:hidden"
      />
      <aside
        aria-label="Sources"
        className="fixed inset-y-0 right-0 z-40 flex w-[min(26rem,92vw)] flex-col border-l border-line bg-sunken shadow-xl lg:static lg:z-auto lg:w-96 lg:shadow-none"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line pr-2 pl-5">
          <h2 className="font-semibold">
            {citations.length === 1 ? "1 source" : `${citations.length} sources`} for this answer
          </h2>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close sources"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-md text-muted hover:bg-surface hover:text-ink"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <ol className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          {citations.map((citation) => {
            const active = citation.index === activeIndex;
            return (
              <li key={citation.index} ref={active ? activeRef : undefined}>
                <button
                  type="button"
                  onClick={() => onSelect(citation.index)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "w-full rounded-lg border bg-surface p-4 text-left transition-colors",
                    active ? "border-accent" : "border-line hover:border-muted/50",
                  )}
                >
                  <span className="flex items-start gap-3">
                    <span
                      className={cn(
                        "grid h-6 min-w-6 place-items-center rounded px-1 text-xs font-semibold tabular-nums",
                        active ? "bg-accent text-accent-ink" : "bg-accent-soft text-accent",
                      )}
                    >
                      {citation.index}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        <FileText className="size-4 shrink-0 text-muted" aria-hidden />
                        <span className="truncate">{citation.documentName}</span>
                      </span>
                      {citation.page && (
                        <span className="text-sm text-muted">Page {citation.page}</span>
                      )}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "mt-3 block font-serif text-[1.0625rem] leading-relaxed",
                      !active && "line-clamp-3 text-muted",
                    )}
                  >
                    <Excerpt citation={citation} highlighted={active} />
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </aside>
    </>
  );
}
