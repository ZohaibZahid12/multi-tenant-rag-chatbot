"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { useCurrentWorkspace } from "@/features/workspaces/workspace-context";
import { cn, formatRelativeDate } from "@/lib/format";

import { useConversations, useDeleteConversation } from "./hooks";

export function ConversationList({ onNavigate }: { onNavigate?: () => void }) {
  const workspace = useCurrentWorkspace();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const router = useRouter();
  const { data: conversations, isPending } = useConversations(workspace.id);
  const deleteConversation = useDeleteConversation(workspace.id);

  if (isPending) {
    return (
      <div className="space-y-2 px-2" aria-hidden>
        {[70, 55, 80].map((width) => (
          <div key={width} className="h-4 rounded bg-line/60" style={{ width: `${width}%` }} />
        ))}
      </div>
    );
  }

  if (!conversations?.length) {
    return <p className="px-2 text-sm text-muted">Questions you ask will be listed here.</p>;
  }

  return (
    <ul className="space-y-0.5">
      {conversations.map((conversation) => {
        const isActive = conversation.id === conversationId;
        return (
          <li key={conversation.id} className="group relative">
            <Link
              href={`/w/${workspace.slug}/chat/${conversation.id}`}
              aria-current={isActive ? "page" : undefined}
              onClick={onNavigate}
              className={cn(
                "block rounded-md py-2 pr-9 pl-2 text-sm transition-colors",
                isActive ? "bg-surface font-medium text-ink" : "text-ink/85 hover:bg-surface/70",
              )}
            >
              <span className="block truncate">{conversation.title}</span>
              <span className="block text-xs text-muted">
                {formatRelativeDate(conversation.updatedAt)}
              </span>
            </Link>
            <button
              type="button"
              aria-label={`Delete "${conversation.title}"`}
              onClick={() => {
                if (!window.confirm(`Delete "${conversation.title}"? This can't be undone.`))
                  return;
                deleteConversation.mutate(conversation.id);
                if (isActive) router.push(`/w/${workspace.slug}/chat`);
              }}
              className="absolute top-1/2 right-1.5 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-danger focus-visible:opacity-100"
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
