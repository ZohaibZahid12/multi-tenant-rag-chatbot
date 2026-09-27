import type { Metadata } from "next";

import { ConversationView } from "@/features/chat/conversation-view";

export const metadata: Metadata = { title: "Conversation" };

export default async function ConversationPage({
  params,
}: PageProps<"/w/[workspace]/chat/[conversationId]">) {
  const { conversationId } = await params;
  // key: a different conversation starts with fresh scroll and source-panel state.
  return <ConversationView key={conversationId} conversationId={conversationId} />;
}
