"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/format";

import { useCurrentWorkspace, useWorkspaces } from "./workspace-context";

function Monogram({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="grid size-8 shrink-0 place-items-center rounded-md bg-accent-soft text-sm font-semibold text-accent"
    >
      {name.charAt(0)}
    </span>
  );
}

export function WorkspaceSwitcher({ onNavigate }: { onNavigate?: () => void }) {
  const current = useCurrentWorkspace();
  const { data: workspaces = [] } = useWorkspaces();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-surface"
      >
        <Monogram name={current.name} />
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-muted">Workspace</span>
          <span className="block truncate font-semibold">{current.name}</span>
        </span>
        <ChevronsUpDown className="size-4 text-muted" aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute inset-x-0 top-full z-30 mt-1 rounded-lg border border-line bg-surface p-1 shadow-lg shadow-black/5"
        >
          {workspaces.map((workspace) => {
            const isCurrent = workspace.id === current.id;
            return (
              <Link
                key={workspace.id}
                role="menuitem"
                href={`/w/${workspace.slug}/chat`}
                aria-current={isCurrent ? "true" : undefined}
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className={cn(
                  "flex items-center gap-3 rounded-md p-2 text-sm hover:bg-sunken",
                  isCurrent && "font-semibold",
                )}
              >
                <Monogram name={workspace.name} />
                <span className="flex-1 truncate">{workspace.name}</span>
                {isCurrent && <Check className="size-4 text-accent" aria-hidden />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
