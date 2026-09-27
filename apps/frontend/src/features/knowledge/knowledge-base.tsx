"use client";

import { useCurrentWorkspace } from "@/features/workspaces/workspace-context";

import { DocumentTable } from "./document-table";
import { useDocuments } from "./hooks";
import { UploadDropzone } from "./upload-dropzone";

function summary(counts: Record<string, number>) {
  const parts = [
    counts.ready && `${counts.ready} searchable`,
    counts.processing && `${counts.processing} being read`,
    counts.failed && `${counts.failed} couldn't be read`,
  ].filter(Boolean);
  return parts.join(", ");
}

export function KnowledgeBase() {
  const workspace = useCurrentWorkspace();
  const { data: documents, isPending, isError, refetch } = useDocuments(workspace.id);

  const counts = (documents ?? []).reduce<Record<string, number>>((acc, doc) => {
    acc[doc.status] = (acc[doc.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8">
        <h1 className="font-serif text-4xl font-medium tracking-tight">Knowledge base</h1>
        <p className="mt-3 max-w-prose text-lg text-muted">
          The assistant answers only from documents here. Only people in {workspace.name} can search
          them.
        </p>

        <div className="mt-8">
          <UploadDropzone workspaceId={workspace.id} />
        </div>

        <section className="mt-10" aria-labelledby="documents-heading">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="documents-heading" className="text-lg font-semibold">
              Documents
            </h2>
            {documents && documents.length > 0 && (
              <p className="text-sm text-muted">{summary(counts)}</p>
            )}
          </div>

          <div className="mt-2">
            {isPending ? (
              <p className="py-8 text-muted">Loading documents…</p>
            ) : isError ? (
              <p className="py-8">
                Documents couldn&apos;t be loaded.{" "}
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="font-medium text-accent underline"
                >
                  Try again
                </button>
              </p>
            ) : documents.length === 0 ? (
              <p className="py-8 text-muted">
                No documents yet. Add the policies, handbooks and guides people in {workspace.name}{" "}
                ask about most.
              </p>
            ) : (
              <DocumentTable documents={documents} workspaceId={workspace.id} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
