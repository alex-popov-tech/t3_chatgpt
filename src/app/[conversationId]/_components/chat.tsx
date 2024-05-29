"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import type { Conversation, Message } from "@prisma/client";

import { api } from "~/trpc/react";
import { BubbleMessage } from "~/app/_components/bubbleMessage";
import { QueryTextArea } from "~/app/_components/queryTextArea";
import { T3Description } from "~/app/_components/t3Description";

export function Chat({
  conversation,
}: {
  conversation: Conversation & { messages: Message[] };
}) {
  const notifyError = (text: string) => toast.error(text);
  const [messages, setMessages] = useState<Message[]>(conversation.messages);
  const [justAdded, setJustAdded] = useState<Message | null>(null);

  const update = api.conversation.update.useMutation({
    onSuccess: ({ input, output }) => {
      setMessages((prev) => [...prev, input, output]);
      setJustAdded(null);
    },
    onError: (it) => {
      notifyError(it.message);
    },
  });

  useEffect(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, [messages, justAdded]);

  const onSubmit = async (content: string) => {
    // optimistically add
    setJustAdded({
      id: Date.now(),
      content,
      role: "USER",
      createdAt: new Date(),
      updatedAt: new Date(),
      conversationId: conversation.id,
    });
    //on success update it finally
    return await update.mutateAsync({ content, convId: conversation.id });
  };

  return (
    <div className="grid grow grid-rows-[1fr_max-content_max-content] gap-4">
      <T3Description />
      <div className="flex flex-col gap-2">
        {[...messages, justAdded].map(
          (msg) => msg && <BubbleMessage key={msg.id} {...msg} />,
        )}
      </div>
      <QueryTextArea onSubmit={onSubmit} />
    </div>
  );
}
