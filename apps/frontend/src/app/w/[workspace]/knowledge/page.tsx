import type { Metadata } from "next";

import { KnowledgeBase } from "@/features/knowledge/knowledge-base";

export const metadata: Metadata = { title: "Knowledge base" };

export default function KnowledgePage() {
  return <KnowledgeBase />;
}
