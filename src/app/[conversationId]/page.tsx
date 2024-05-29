import { api } from "~/trpc/server";
import { Chat } from "./_components/chat";

export default async function Conversation({
  params,
}: {
  params: { conversationId: string };
}) {
  const convId = parseInt(params.conversationId, 10);
  const conv = await api.conversation.get({ id: convId });
  return <Chat conversation={conv} />;
}
