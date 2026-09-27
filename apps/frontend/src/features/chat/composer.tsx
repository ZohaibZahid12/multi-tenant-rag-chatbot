"use client";

import { ArrowUp, Square } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";

export function Composer({
  onSubmit,
  onStop,
  busy = false,
  placeholder = "Ask a question about your documents",
}: {
  onSubmit: (question: string) => void;
  onStop?: () => void;
  /** An answer is being written; sending is paused and Stop is shown instead. */
  busy?: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const submit = () => {
    const question = value.trim();
    if (!question || busy) return;
    onSubmit(question);
    setValue("");
    requestAnimationFrame(resize);
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="mx-auto w-full max-w-176 px-4 pb-4"
    >
      <div className="flex items-end gap-2 rounded-xl border border-line bg-surface p-2 shadow-sm transition-colors focus-within:border-accent">
        <textarea
          ref={inputRef}
          value={value}
          rows={1}
          aria-label="Your question"
          placeholder={placeholder}
          onChange={(event) => {
            setValue(event.target.value);
            resize();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              submit();
            }
          }}
          className="max-h-48 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 leading-6 placeholder:text-muted focus-visible:outline-none"
        />
        {busy && onStop ? (
          <Button variant="secondary" onClick={onStop} aria-label="Stop answering">
            <Square className="size-3.5 fill-current" aria-hidden />
            Stop
          </Button>
        ) : (
          <Button
            type="submit"
            aria-label="Send question"
            disabled={!value.trim() || busy}
            size="icon"
          >
            <ArrowUp className="size-5" aria-hidden />
          </Button>
        )}
      </div>
      <p className="mt-2 px-1 text-xs text-muted">
        Answers come only from this workspace&apos;s documents. Check the sources before relying on
        them. Press Shift + Enter for a new line.
      </p>
    </form>
  );
}
