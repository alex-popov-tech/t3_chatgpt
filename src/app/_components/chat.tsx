"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import type { Conversation, Message } from "@prisma/client";

import { api } from "~/trpc/react";
import { BubbleMessage } from "./bubbleMessage";
import { QueryTextArea } from "./queryTextArea";
import { T3Description } from "./t3Description";
import { useOptimisticMessage } from "../hooks/useOptimisticMessage";

export function Chat(props: {
  conversation?: Conversation & { messages: Message[] };
}) {
  const onError = ({ message }: { message: string }) => toast.error(message);
  const [conversation, setConversation] = useState(props.conversation);
  const { optimisticMessage, setOptimisticMessage, clearOptimisticMessage } =
    useOptimisticMessage();

  useEffect(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, [conversation, optimisticMessage]);

  const update = api.conversation.update.useMutation({
    onSuccess: ({ input, output }) => {
      clearOptimisticMessage();
      setConversation({
        ...conversation!,
        messages: [...conversation!.messages, input, output],
      });
    },
    onError,
  });
  const create = api.conversation.create.useMutation({
    onSuccess: (it) => {
      window.history.pushState({}, "", `/${it.conversation!.id}`);
      setConversation(it.conversation!);
    },
    onError,
  });

  const onSubmit = async (content: string) => {
    // optimistically add
    setOptimisticMessage({ content });
    if (conversation) {
      return await update.mutateAsync({ content, convId: conversation.id });
    } else {
      return await create.mutateAsync({ content });
    }
  };

  return (
    <div className="grid grow grid-rows-[1fr_max-content_max-content] gap-4">
      <T3Description />
      <div className="flex flex-col gap-2">
        {[...(conversation?.messages ?? []), optimisticMessage].map(
          (msg) => msg && <BubbleMessage key={msg.id} {...msg} />,
        )}
      </div>
      <QueryTextArea onSubmit={onSubmit} />
    </div>
  );
}
