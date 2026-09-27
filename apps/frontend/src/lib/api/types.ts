/**
 * Shapes of the data the Django API will return.
 * The mock server in src/lib/mock returns exactly these, so swapping in the real API
 * only changes src/lib/api/client.ts.
 */

export type Workspace = {
  id: string;
  slug: string;
  name: string;
};

export type DocumentStatus = "processing" | "ready" | "failed";

export type KnowledgeDocument = {
  id: string;
  workspaceId: string;
  name: string;
  /** File extension without the dot: pdf, docx, txt, md */
  fileType: string;
  sizeBytes: number;
  status: DocumentStatus;
  /** 0–100 while processing */
  progress: number;
  /** Number of searchable passages the document was split into */
  chunkCount: number;
  /** Why processing failed, written for the person who uploaded the file */
  error: string | null;
  uploadedAt: string;
};

export type Citation = {
  /** 1-based number shown in the answer as [n] */
  index: number;
  documentId: string;
  documentName: string;
  page: number | null;
  /** The passage the answer drew on */
  excerpt: string;
  /** The part of the excerpt that directly supports the answer */
  quote: string;
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations: Citation[];
  createdAt: string;
};

export type ConversationSummary = {
  id: string;
  workspaceId: string;
  title: string;
  updatedAt: string;
};

export type Conversation = ConversationSummary & {
  messages: Message[];
};

/** Events emitted while an answer is generated (will map to server-sent events). */
export type ReplyEvent =
  | { type: "sources"; citations: Citation[] }
  | { type: "token"; text: string }
  | { type: "done"; userMessage: Message; assistantMessage: Message };

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
