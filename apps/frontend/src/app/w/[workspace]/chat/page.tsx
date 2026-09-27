import type { Metadata } from "next";

import { NewChat } from "@/features/chat/new-chat";

export const metadata: Metadata = { title: "New conversation" };

export default function NewChatPage() {
  return <NewChat />;
}
