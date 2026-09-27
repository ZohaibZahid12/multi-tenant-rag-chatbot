/**
 * In-browser stand-in for the Django API. Data lives in memory and resets on reload.
 *
 * Retrieval here is simple keyword overlap, not embeddings, but it has the same inputs and
 * outputs as the real pipeline: a question in, ranked passages and a cited answer out.
 */
import type { Api } from "@/lib/api/client";
import { ACCEPTED_FILE_TYPES, MAX_FILE_BYTES } from "@/lib/api/limits";
import {
  ApiError,
  type Citation,
  type Conversation,
  type KnowledgeDocument,
  type Message,
  type ReplyEvent,
} from "@/lib/api/types";

import * as seed from "./seed";
import type { Chunk } from "./seed";

const db = {
  workspaces: structuredClone(seed.workspaces),
  documents: structuredClone(seed.documents),
  chunks: structuredClone(seed.chunks),
  conversations: structuredClone(seed.conversations),
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const copy = <T>(value: T): T => structuredClone(value);
const now = () => new Date().toISOString();

function findDocument(id: string) {
  const found = db.documents.find((d) => d.id === id);
  if (!found) throw new ApiError("Document not found.", 404);
  return found;
}

function findConversation(id: string) {
  const found = db.conversations.find((c) => c.id === id);
  if (!found) throw new ApiError("Conversation not found.", 404);
  return found;
}

// ─── Document processing ────────────────────────────────────────────────────

/** Moves a document from processing to ready (or failed) over a few seconds. */
function simulateProcessing(doc: KnowledgeDocument, failure: string | null) {
  const timer = setInterval(() => {
    doc.progress = Math.min(100, doc.progress + 8 + Math.round(Math.random() * 14));
    if (doc.progress < 100) return;
    clearInterval(timer);
    if (failure) {
      doc.status = "failed";
      doc.progress = 0;
      doc.error = failure;
    } else {
      doc.status = "ready";
      doc.chunkCount = Math.max(
        db.chunks.filter((c) => c.documentId === doc.id).length,
        Math.ceil(doc.sizeBytes / 40_000),
      );
    }
  }, 450);
}

/** Splits plain text into passages of a few hundred characters, on paragraph boundaries. */
function splitIntoChunks(documentId: string, text: string): Chunk[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    // Headings have no full stop; add one so they don't run into the next sentence.
    .map((p) => (/[.!?:]$/.test(p) ? p : `${p}.`));

  const result: Chunk[] = [];
  let current = "";
  for (const paragraph of paragraphs) {
    if (current && current.length + paragraph.length > 600) {
      result.push({ documentId, page: null, text: current });
      current = "";
    }
    current = current ? `${current} ${paragraph}` : paragraph;
  }
  if (current) result.push({ documentId, page: null, text: current });
  return result;
}

if (typeof window !== "undefined") {
  for (const doc of db.documents.filter((d) => d.status === "processing")) {
    simulateProcessing(doc, null);
  }
}

// ─── Retrieval ──────────────────────────────────────────────────────────────

const STOPWORDS = new Set(
  "a an and are as at be before by can do does for from has have how i if in is it its me my of on or our should the their them there they this to was we what when where which who why will with you your need needs after about any into than then".split(
    " ",
  ),
);

function terms(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9][a-z0-9-]*/g) ?? [])
    .filter((word) => word.length > 1 && !STOPWORDS.has(word))
    .map((word) => word.replace(/(ing|ed|es|s)$/, (suffix) => (word.length > 5 ? "" : suffix)));
}

function overlap(queryTerms: Set<string>, text: string) {
  return terms(text).filter((t) => queryTerms.has(t)).length;
}

function sentences(text: string) {
  return text.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [text];
}

function retrieve(workspaceId: string, question: string) {
  const queryTerms = new Set(terms(question));
  const readyDocuments = new Map(
    db.documents
      .filter((d) => d.workspaceId === workspaceId && d.status === "ready")
      .map((d) => [d.id, d]),
  );

  return db.chunks
    .filter((chunk) => readyDocuments.has(chunk.documentId))
    .map((chunk) => ({ chunk, score: overlap(queryTerms, chunk.text) }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ chunk }, i): Citation => {
      const best = sentences(chunk.text).reduce((top, sentence) =>
        overlap(queryTerms, sentence) > overlap(queryTerms, top) ? sentence : top,
      );
      return {
        index: i + 1,
        documentId: chunk.documentId,
        documentName: readyDocuments.get(chunk.documentId)!.name,
        page: chunk.page,
        excerpt: chunk.text,
        quote: best,
      };
    });
}

function composeAnswer(citations: Citation[]) {
  if (citations.length === 0) {
    return "I couldn't find this in the documents in this workspace. Upload a document that covers it on the Knowledge base page, then ask again.";
  }
  return citations.map((c) => `${c.quote.replace(/\.$/, "")} [${c.index}].`).join(" ");
}

// ─── API ────────────────────────────────────────────────────────────────────

export const mockApi: Api = {
  async listWorkspaces() {
    await wait(150);
    return copy(db.workspaces);
  },

  async listDocuments(workspaceId) {
    await wait(250);
    return copy(
      db.documents
        .filter((d) => d.workspaceId === workspaceId)
        .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)),
    );
  },

  async uploadDocument(workspaceId, file) {
    await wait(500);
    const fileType = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ACCEPTED_FILE_TYPES.includes(fileType)) {
      throw new ApiError(`${file.name} is a .${fileType} file. Upload PDF, DOCX, TXT or MD.`, 400);
    }
    if (file.size > MAX_FILE_BYTES) {
      throw new ApiError(`${file.name} is larger than 20 MB. Split it into smaller files.`, 400);
    }

    const doc: KnowledgeDocument = {
      id: `doc_${crypto.randomUUID()}`,
      workspaceId,
      name: file.name,
      fileType,
      sizeBytes: file.size,
      status: "processing",
      progress: 0,
      chunkCount: 0,
      error: null,
      uploadedAt: now(),
    };
    db.documents.push(doc);

    // The mock can read plain-text files; PDF and DOCX are accepted but not searchable here.
    let failure: string | null = file.size === 0 ? "This file is empty." : null;
    if (!failure && (fileType === "txt" || fileType === "md")) {
      const newChunks = splitIntoChunks(doc.id, await file.text());
      if (newChunks.length === 0) failure = "This file has no text in it.";
      db.chunks.push(...newChunks);
    }
    simulateProcessing(doc, failure);
    return copy(doc);
  },

  async deleteDocument(documentId) {
    await wait(300);
    findDocument(documentId);
    db.documents = db.documents.filter((d) => d.id !== documentId);
    db.chunks = db.chunks.filter((c) => c.documentId !== documentId);
  },

  async listConversations(workspaceId) {
    await wait(200);
    return db.conversations
      .filter((c) => c.workspaceId === workspaceId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map(({ messages: _messages, ...summary }) => copy(summary));
  },

  async getConversation(conversationId) {
    await wait(200);
    return copy(findConversation(conversationId));
  },

  async createConversation(workspaceId, title) {
    await wait(150);
    const conversation: Conversation = {
      id: `conv_${crypto.randomUUID()}`,
      workspaceId,
      title,
      updatedAt: now(),
      messages: [],
    };
    db.conversations.push(conversation);
    const { messages: _messages, ...summary } = conversation;
    return copy(summary);
  },

  async deleteConversation(conversationId) {
    await wait(200);
    findConversation(conversationId);
    db.conversations = db.conversations.filter((c) => c.id !== conversationId);
  },

  async streamReply(conversationId, content, onEvent, signal) {
    const conversation = findConversation(conversationId);
    const emit = (event: ReplyEvent) => onEvent(copy(event));

    await wait(700); // "searching the knowledge base"
    const citations = retrieve(conversation.workspaceId, content);
    emit({ type: "sources", citations });

    let answer = "";
    for (const word of composeAnswer(citations).split(/(?<= )/)) {
      if (signal?.aborted) break;
      await wait(28);
      answer += word;
      emit({ type: "token", text: word });
    }

    const userMessage: Message = {
      id: `msg_${crypto.randomUUID()}`,
      role: "user",
      content,
      citations: [],
      createdAt: now(),
    };
    const assistantMessage: Message = {
      id: `msg_${crypto.randomUUID()}`,
      role: "assistant",
      content: answer.trim(),
      // Keep only sources the (possibly stopped) answer actually reached.
      citations: citations.filter((c) => answer.includes(`[${c.index}]`)),
      createdAt: now(),
    };
    conversation.messages.push(userMessage, assistantMessage);
    conversation.updatedAt = now();
    emit({ type: "done", userMessage, assistantMessage });
  },
};
