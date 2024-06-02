import { api } from "~/trpc/server";
import { Chat } from "~/app/_components/chat";
import { type Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { conversationId: string };
}): Promise<Metadata> {
  const currentConversationId = parseInt(params.conversationId, 10);
  const conversation = await api.conversation.get({
    id: currentConversationId,
  });

  return { title: conversation.title };
}

export default async function Conversation({
  params,
}: {
  params: { conversationId: string };
}) {
  const currentConversationId = parseInt(params.conversationId, 10);
  const conversation = await api.conversation.get({
    id: currentConversationId,
  });
  return <Chat conversation={conversation} />;
}
