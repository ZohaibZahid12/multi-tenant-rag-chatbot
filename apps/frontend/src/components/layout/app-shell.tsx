"use client";

import { BookOpen, Menu, Plus, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { buttonClasses } from "@/components/ui/button";
import { ConversationList } from "@/features/chat/conversation-list";
import { useDocuments } from "@/features/knowledge/hooks";
import {
  useCurrentWorkspace,
  useWorkspaces,
  WorkspaceProvider,
} from "@/features/workspaces/workspace-context";
import { WorkspaceSwitcher } from "@/features/workspaces/workspace-switcher";
import { cn } from "@/lib/format";

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const workspace = useCurrentWorkspace();
  const pathname = usePathname();
  const { data: documents } = useDocuments(workspace.id);
  const readyCount = documents?.filter((d) => d.status === "ready").length;
  const knowledgeHref = `/w/${workspace.slug}/knowledge`;

  return (
    <div className="flex h-full flex-col gap-4 p-3">
      <WorkspaceSwitcher onNavigate={onNavigate} />

      <div className="space-y-1">
        <Link
          href={`/w/${workspace.slug}/chat`}
          onClick={onNavigate}
          className={buttonClasses({ variant: "secondary", className: "w-full justify-start" })}
        >
          <Plus className="size-4" aria-hidden />
          New conversation
        </Link>
        <Link
          href={knowledgeHref}
          onClick={onNavigate}
          aria-current={pathname === knowledgeHref ? "page" : undefined}
          className={cn(
            "flex h-10 items-center gap-2 rounded-md px-4 text-[0.9375rem] font-medium transition-colors",
            pathname === knowledgeHref ? "bg-surface text-ink" : "text-ink/85 hover:bg-surface/70",
          )}
        >
          <BookOpen className="size-4" aria-hidden />
          <span className="flex-1">Knowledge base</span>
          {readyCount !== undefined && (
            <span
              className="text-sm text-muted tabular-nums"
              aria-label={`${readyCount} documents`}
            >
              {readyCount}
            </span>
          )}
        </Link>
      </div>

      <nav aria-label="Conversations" className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1">
        <h2 className="mb-2 px-2 text-sm font-medium text-muted">Conversations</h2>
        <ConversationList onNavigate={onNavigate} />
      </nav>

      <p className="px-2 text-xs leading-relaxed text-muted">
        Demo data. Your changes reset when you reload the page.
      </p>
    </div>
  );
}

function FullPageMessage({ children }: { children: React.ReactNode }) {
  return <div className="grid h-dvh place-items-center p-6 text-center">{children}</div>;
}

export function AppShell({ slug, children }: { slug: string; children: React.ReactNode }) {
  const { data: workspaces, isPending, isError } = useWorkspaces();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  if (isPending) {
    return (
      <FullPageMessage>
        <p className="text-muted">Loading workspace…</p>
      </FullPageMessage>
    );
  }

  if (isError) {
    return (
      <FullPageMessage>
        <p>Workspaces couldn&apos;t be loaded. Check that the API is running, then reload.</p>
      </FullPageMessage>
    );
  }

  const workspace = workspaces.find((w) => w.slug === slug);
  if (!workspace) {
    return (
      <FullPageMessage>
        <div className="max-w-sm space-y-4">
          <h1 className="text-xl font-semibold">There&apos;s no workspace called “{slug}”</h1>
          <p className="text-muted">Open one of the workspaces you belong to:</p>
          <ul className="space-y-2">
            {workspaces.map((w) => (
              <li key={w.id}>
                <Link href={`/w/${w.slug}/chat`} className="font-medium text-accent underline">
                  {w.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </FullPageMessage>
    );
  }

  return (
    <WorkspaceProvider value={workspace}>
      <div className="flex h-dvh">
        <aside className="hidden w-72 shrink-0 border-r border-line bg-paper md:block">
          <Sidebar />
        </aside>

        {menuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              aria-label="Close menu"
              onClick={closeMenu}
              className="absolute inset-0 bg-black/40"
            />
            <aside className="relative h-full w-[min(20rem,85vw)] bg-paper shadow-xl">
              <button
                type="button"
                aria-label="Close menu"
                onClick={closeMenu}
                className="absolute top-4 right-3 z-10 grid size-8 place-items-center rounded-md text-muted hover:text-ink"
              >
                <X className="size-5" aria-hidden />
              </button>
              <Sidebar onNavigate={closeMenu} />
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col bg-surface">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line px-2 md:hidden">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              className="grid size-10 place-items-center rounded-md hover:bg-sunken"
            >
              <Menu className="size-5" aria-hidden />
            </button>
            <span className="truncate font-semibold">{workspace.name}</span>
          </header>
          <main className="min-h-0 flex-1">{children}</main>
        </div>
      </div>
    </WorkspaceProvider>
  );
}
