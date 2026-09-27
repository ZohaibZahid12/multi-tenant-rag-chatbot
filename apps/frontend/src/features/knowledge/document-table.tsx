"use client";

import { FileText, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { KnowledgeDocument } from "@/lib/api/types";
import { cn, formatBytes, formatRelativeDate } from "@/lib/format";

import { useDeleteDocument } from "./hooks";

function Status({ doc }: { doc: KnowledgeDocument }) {
  if (doc.status === "processing") {
    return (
      <div className="w-28">
        <div className="flex justify-between text-sm font-medium text-accent">
          <span>Reading</span>
          <span className="tabular-nums">{doc.progress}%</span>
        </div>
        <div
          role="progressbar"
          aria-label={`Reading ${doc.name}`}
          aria-valuenow={doc.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-1 h-1.5 overflow-hidden rounded-full bg-accent-soft"
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500"
            style={{ width: `${doc.progress}%` }}
          />
        </div>
      </div>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-sm font-medium",
        doc.status === "ready" ? "bg-ok-soft text-ok" : "bg-danger-soft text-danger",
      )}
    >
      {doc.status === "ready" ? "Searchable" : "Couldn't read"}
    </span>
  );
}

function RemoveButton({ doc, workspaceId }: { doc: KnowledgeDocument; workspaceId: string }) {
  const remove = useDeleteDocument(workspaceId);
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex justify-end gap-1">
        <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
        <Button
          size="sm"
          variant="danger"
          disabled={remove.isPending}
          onClick={() => remove.mutate(doc.id)}
        >
          {remove.isPending ? "Removing…" : "Remove"}
        </Button>
      </div>
    );
  }
  return (
    <Button
      size="icon-sm"
      variant="ghost"
      aria-label={`Remove ${doc.name}`}
      onClick={() => setConfirming(true)}
    >
      <Trash2 className="size-4" aria-hidden />
    </Button>
  );
}

export function DocumentTable({
  documents,
  workspaceId,
}: {
  documents: KnowledgeDocument[];
  workspaceId: string;
}) {
  return (
    <table className="w-full text-left">
      <thead className="border-b border-line text-sm text-muted">
        <tr>
          <th scope="col" className="py-3 pr-4 font-medium">
            Document
          </th>
          <th scope="col" className="py-3 pr-4 font-medium">
            Status
          </th>
          <th scope="col" className="hidden py-3 pr-4 text-right font-medium sm:table-cell">
            Passages
          </th>
          <th scope="col" className="hidden py-3 pr-4 text-right font-medium md:table-cell">
            Size
          </th>
          <th scope="col" className="hidden py-3 pr-4 font-medium lg:table-cell">
            Added
          </th>
          <th scope="col" className="py-3">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {documents.map((doc) => (
          <tr key={doc.id} className="border-b border-line align-top last:border-b-0">
            <td className="py-4 pr-4">
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden />
                <div className="min-w-0">
                  <p className="font-medium break-words">{doc.name}</p>
                  {doc.error && <p className="mt-1 max-w-md text-sm text-danger">{doc.error}</p>}
                </div>
              </div>
            </td>
            <td className="py-4 pr-4">
              <Status doc={doc} />
            </td>
            <td className="hidden py-4 pr-4 text-right tabular-nums sm:table-cell">
              {doc.status === "ready" ? doc.chunkCount : <span className="text-muted">None</span>}
            </td>
            <td className="hidden py-4 pr-4 text-right text-muted tabular-nums md:table-cell">
              {formatBytes(doc.sizeBytes)}
            </td>
            <td className="hidden py-4 pr-4 text-muted lg:table-cell">
              {formatRelativeDate(doc.uploadedAt)}
            </td>
            <td className="py-3 text-right">
              <RemoveButton doc={doc} workspaceId={workspaceId} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
