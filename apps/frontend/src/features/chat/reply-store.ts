"use client";

/**
 * Answers that are still being generated, keyed by conversation.
 *
 * Lives outside React so a reply keeps streaming while the user moves from the "new chat"
 * page to the conversation's own page. When the reply finishes it is written into the
 * React Query cache and removed from here.
 */
import type { QueryClient } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";

import { api } from "@/lib/api/client";
import type { Citation, Conversation } from "@/lib/api/types";

import { conversationKey, conversationsKey } from "./hooks";

export type PendingReply = {
  question: string;
  answer: string;
  citations: Citation[];
  phase: "searching" | "writing" | "failed";
  error: string | null;
};

const replies = new Map<string, PendingReply>();
const controllers = new Map<string, AbortController>();
const listeners = new Set<() => void>();

function set(conversationId: string, reply: PendingReply | undefined) {
  if (reply) replies.set(conversationId, reply);
  else replies.delete(conversationId);
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePendingReply(conversationId: string) {
  return useSyncExternalStore(
    subscribe,
    () => replies.get(conversationId),
    () => undefined,
  );
}

export async function startReply(
  queryClient: QueryClient,
  conversation: { id: string; workspaceId: string },
  question: string,
) {
  const controller = new AbortController();
  controllers.set(conversation.id, controller);
  let reply: PendingReply = {
    question,
    answer: "",
    citations: [],
    phase: "searching",
    error: null,
  };
  set(conversation.id, reply);

  try {
    await api.streamReply(
      conversation.id,
      question,
      (event) => {
        if (event.type === "sources") {
          reply = { ...reply, citations: event.citations, phase: "writing" };
        } else if (event.type === "token") {
          reply = { ...reply, answer: reply.answer + event.text };
        } else {
          queryClient.setQueryData<Conversation>(conversationKey(conversation.id), (old) =>
            old
              ? { ...old, messages: [...old.messages, event.userMessage, event.assistantMessage] }
              : old,
          );
          void queryClient.invalidateQueries({
            queryKey: conversationsKey(conversation.workspaceId),
          });
          set(conversation.id, undefined);
          return;
        }
        set(conversation.id, reply);
      },
      controller.signal,
    );
  } catch (error) {
    set(conversation.id, {
      ...reply,
      phase: "failed",
      error: error instanceof Error ? error.message : "The answer couldn't be generated.",
    });
  } finally {
    controllers.delete(conversation.id);
  }
}

export function stopReply(conversationId: string) {
  controllers.get(conversationId)?.abort();
}

export function dismissReply(conversationId: string) {
  set(conversationId, undefined);
}
