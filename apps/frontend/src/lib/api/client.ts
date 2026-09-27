import { mockApi } from "@/lib/mock/server";

import type {
  Conversation,
  ConversationSummary,
  KnowledgeDocument,
  ReplyEvent,
  Workspace,
} from "./types";

/**
 * Everything the UI needs from the backend. Features call `api.*` and never fetch directly.
 *
 * Today this is backed by the in-browser mock. When the Django endpoints exist, implement
 * this interface with fetch calls to process.env.NEXT_PUBLIC_API_URL and export that instead.
 */
export interface Api {
  listWorkspaces(): Promise<Workspace[]>;

  listDocuments(workspaceId: string): Promise<KnowledgeDocument[]>;
  uploadDocument(workspaceId: string, file: File): Promise<KnowledgeDocument>;
  deleteDocument(documentId: string): Promise<void>;

  listConversations(workspaceId: string): Promise<ConversationSummary[]>;
  getConversation(conversationId: string): Promise<Conversation>;
  createConversation(workspaceId: string, title: string): Promise<ConversationSummary>;
  deleteConversation(conversationId: string): Promise<void>;
  /** Streams an answer. Resolves after the final `done` event. */
  streamReply(
    conversationId: string,
    content: string,
    onEvent: (event: ReplyEvent) => void,
    signal?: AbortSignal,
  ): Promise<void>;
}

export const api: Api = mockApi;
