"use client";

import { useQueryClient } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useDocuments } from "@/features/knowledge/hooks";
import { useCurrentWorkspace } from "@/features/workspaces/workspace-context";
import { api } from "@/lib/api/client";

import { Composer } from "./composer";
import { conversationsKey } from "./hooks";
import { startReply } from "./reply-store";

function titleFrom(question: string) {
  const clean = question.replace(/\s+/g, " ").trim();
  return clean.length > 60 ? `${clean.slice(0, 57).trimEnd()}…` : clean;
}

export function NewChat() {
  const workspace = useCurrentWorkspace();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: documents } = useDocuments(workspace.id);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const ready = documents?.filter((d) => d.status === "ready") ?? [];
  const knowledgeHref = `/w/${workspace.slug}/knowledge`;

  const ask = async (question: string) => {
    setError(null);
    setStarting(true);
    try {
      const conversation = await api.createConversation(workspace.id, titleFrom(question));
      void startReply(queryClient, conversation, question);
      void queryClient.invalidateQueries({ queryKey: conversationsKey(workspace.id) });
      router.push(`/w/${workspace.slug}/chat/${conversation.id}`);
    } catch {
      setError("The conversation couldn't be started. Try again.");
      setStarting(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-176 px-4 pt-[12vh] pb-10">
          <h1 className="font-serif text-4xl leading-tight font-medium tracking-tight text-balance sm:text-5xl">
            What do you want to know?
          </h1>

          {documents === undefined ? null : ready.length === 0 ? (
            <p className="mt-4 max-w-prose text-lg text-muted">
              {workspace.name} has no searchable documents yet, so there&apos;s nothing to answer
              from.{" "}
              <Link href={knowledgeHref} className="font-medium text-accent underline">
                Upload documents
              </Link>{" "}
              first.
            </p>
          ) : (
            <>
              <p className="mt-4 max-w-prose text-lg text-muted">
                Answers are written only from the documents in {workspace.name}, and every claim
                links to the passage it came from.
              </p>
              <div className="mt-10">
                <h2 className="text-sm font-medium">
                  Searching {ready.length} {ready.length === 1 ? "document" : "documents"}
                </h2>
                <ul className="mt-3 space-y-2">
                  {ready.map((doc) => (
                    <li key={doc.id} className="flex items-center gap-2 text-[0.9375rem]">
                      <FileText className="size-4 shrink-0 text-muted" aria-hidden />
                      <span className="truncate">{doc.name}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={knowledgeHref}
                  className="mt-4 inline-block text-sm font-medium text-accent underline-offset-4 hover:underline"
                >
                  Manage documents
                </Link>
              </div>
            </>
          )}

          {error && (
            <p role="alert" className="mt-6 text-danger">
              {error}
            </p>
          )}
        </div>
      </div>
      <Composer onSubmit={ask} busy={starting} />
    </div>
  );
}
