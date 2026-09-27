"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ACCEPTED_FILE_TYPES, MAX_FILE_BYTES } from "@/lib/api/limits";
import { ApiError } from "@/lib/api/types";
import { cn } from "@/lib/format";

import { useUploadDocument } from "./hooks";

/** Checks a file before uploading so obvious problems don't wait on the server. */
function problemWith(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ACCEPTED_FILE_TYPES.includes(extension)) {
    return `${file.name} isn't a PDF, DOCX, TXT or MD file.`;
  }
  if (file.size > MAX_FILE_BYTES) return `${file.name} is larger than 20 MB.`;
  return null;
}

export function UploadDropzone({ workspaceId }: { workspaceId: string }) {
  const upload = useUploadDocument(workspaceId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);

  const handleFiles = async (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;

    const found: string[] = [];
    for (const file of files) {
      const problem = problemWith(file);
      if (problem) {
        found.push(problem);
        continue;
      }
      try {
        await upload.mutateAsync(file);
      } catch (error) {
        found.push(
          error instanceof ApiError ? error.message : `${file.name} couldn't be uploaded.`,
        );
      }
    }
    setProblems(found);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-start gap-4 rounded-xl border-2 border-dashed p-6 transition-colors sm:flex-row sm:items-center",
          dragging ? "border-accent bg-accent-soft" : "border-line bg-sunken",
        )}
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-surface text-accent">
          <Upload className="size-5" aria-hidden />
        </span>
        <div className="flex-1">
          <p className="font-medium">
            {upload.isPending ? "Uploading…" : "Drop files here to add them"}
          </p>
          <p className="text-sm text-muted">PDF, DOCX, TXT or MD, up to 20 MB each.</p>
        </div>
        <Button onClick={() => inputRef.current?.click()} disabled={upload.isPending}>
          Choose files
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_FILE_TYPES.map((type) => `.${type}`).join(",")}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(event) => void handleFiles(event.target.files)}
        />
      </div>

      {problems.length > 0 && (
        <ul
          role="alert"
          className="mt-3 space-y-1 rounded-lg bg-danger-soft p-4 text-sm text-danger"
        >
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
