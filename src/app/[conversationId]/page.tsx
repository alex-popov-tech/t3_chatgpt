import { api } from "~/trpc/server";
import { Chat } from "~/app/_components/chat";

export default async function Conversation({
  params,
}: {
  params: { conversationId: string };
}) {
  const conversationId = parseInt(params.conversationId, 10);
  const conversation = await api.conversation.get({ id: conversationId });
  return <Chat conversation={conversation} />;
}
