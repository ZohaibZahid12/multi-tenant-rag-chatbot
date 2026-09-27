"use client";

import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useCurrentWorkspace } from "@/features/workspaces/workspace-context";
import type { Citation, Message } from "@/lib/api/types";

import { Answer, SourceList } from "./answer";
import { Composer } from "./composer";
import { useConversation } from "./hooks";
import { dismissReply, startReply, stopReply, usePendingReply } from "./reply-store";
import { SourcesPanel } from "./sources-panel";

type Turn = { key: string; question: string; answer: Message | null };

function toTurns(messages: Message[]): Turn[] {
  const turns: Turn[] = [];
  for (const message of messages) {
    if (message.role === "user") {
      turns.push({ key: message.id, question: message.content, answer: null });
    } else if (turns.length > 0) {
      turns[turns.length - 1].answer = message;
    }
  }
  return turns;
}

const PENDING = "pending";

export function ConversationView({ conversationId }: { conversationId: string }) {
  const workspace = useCurrentWorkspace();
  const queryClient = useQueryClient();
  const { data: conversation, isPending, isError } = useConversation(conversationId);
  const pending = usePendingReply(conversationId);

  // Which answer's sources are open, and which source within it.
  const [selected, setSelected] = useState<{ turn: string; index: number } | null>(null);
  const closeSources = useCallback(() => setSelected(null), []);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const turns = conversation ? toTurns(conversation.messages) : [];

  useEffect(() => {
    const el = scrollerRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [turns.length, pending?.answer, pending?.phase]);

  if (isPending) {
    return <p className="p-8 text-muted">Loading conversation…</p>;
  }

  if (isError || !conversation || conversation.workspaceId !== workspace.id) {
    return (
      <div className="mx-auto max-w-176 space-y-3 px-4 py-16">
        <h1 className="text-xl font-semibold">This conversation doesn&apos;t exist</h1>
        <p className="text-muted">It may have been deleted, or it belongs to another workspace.</p>
        <Link href={`/w/${workspace.slug}/chat`} className="font-medium text-accent underline">
          Start a new conversation
        </Link>
      </div>
    );
  }

  const ask = (question: string) => {
    stickToBottom.current = true;
    setSelected(null);
    void startReply(queryClient, conversation, question);
  };

  const selectedCitations: Citation[] =
    selected?.turn === PENDING
      ? (pending?.citations ?? [])
      : (turns.find((t) => t.key === selected?.turn)?.answer?.citations ?? []);

  return (
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col">
        <div
          ref={scrollerRef}
          onScroll={(event) => {
            const el = event.currentTarget;
            stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
          }}
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <div className="mx-auto max-w-176 px-4 pt-8 pb-12">
            <h1 className="sr-only">{conversation.title}</h1>

            <div className="space-y-10">
              {turns.map((turn) => (
                <TurnView
                  key={turn.key}
                  question={turn.question}
                  answer={
                    turn.answer && (
                      <>
                        <Answer
                          content={turn.answer.content}
                          citations={turn.answer.citations}
                          activeIndex={selected?.turn === turn.key ? selected.index : null}
                          onCite={(index) => setSelected({ turn: turn.key, index })}
                        />
                        <SourceList
                          citations={turn.answer.citations}
                          activeIndex={selected?.turn === turn.key ? selected.index : null}
                          onCite={(index) => setSelected({ turn: turn.key, index })}
                        />
                      </>
                    )
                  }
                />
              ))}

              {pending && (
                <TurnView
                  question={pending.question}
                  answer={
                    pending.phase === "searching" ? (
                      <p className="flex items-center gap-2 text-muted" role="status">
                        <span className="size-2 animate-pulse rounded-full bg-accent" aria-hidden />
                        Searching {workspace.name}&apos;s documents…
                      </p>
                    ) : pending.phase === "failed" ? (
                      <div role="alert" className="rounded-lg bg-danger-soft p-4">
                        <p className="flex items-center gap-2 font-medium text-danger">
                          <AlertCircle className="size-4" aria-hidden />
                          {pending.error}
                        </p>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" onClick={() => ask(pending.question)}>
                            Ask again
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => dismissReply(conversation.id)}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div aria-live="polite">
                        <Answer
                          content={pending.answer}
                          citations={pending.citations}
                          activeIndex={selected?.turn === PENDING ? selected.index : null}
                          onCite={(index) => setSelected({ turn: PENDING, index })}
                          streaming
                        />
                      </div>
                    )
                  }
                />
              )}
            </div>
          </div>
        </div>

        <Composer
          onSubmit={ask}
          busy={pending?.phase === "searching" || pending?.phase === "writing"}
          onStop={() => stopReply(conversation.id)}
          placeholder="Ask a follow-up question"
        />
      </div>

      {selected && selectedCitations.length > 0 && (
        <SourcesPanel
          citations={selectedCitations}
          activeIndex={selected.index}
          onSelect={(index) => setSelected({ ...selected, index })}
          onClose={closeSources}
        />
      )}
    </div>
  );
}

function TurnView({ question, answer }: { question: string; answer: React.ReactNode }) {
  return (
    <article className="border-t border-line pt-10 first:border-t-0 first:pt-0">
      <h2 className="text-lg leading-snug font-semibold text-balance">{question}</h2>
      <div className="mt-4">{answer}</div>
    </article>
  );
}
