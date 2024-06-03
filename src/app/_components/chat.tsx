"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import type { Conversation, Message, ROLE } from "@prisma/client";

import { api } from "~/trpc/react";
import { BubbleMessage } from "./bubbleMessage";
import { QueryTextArea } from "./queryTextArea";
import { T3Description } from "./t3Description";

const makeFakeOutput = (content: string, role: ROLE) => ({
  content,
  role,
  id: Date.now(),
  createdAt: new Date(),
  updatedAt: new Date(),
  conversationId: Number.MAX_VALUE,
});

export function Chat(props: {
  conversation?: Conversation & { messages: Message[] };
}) {
  const onError = ({ message }: { message: string }) => toast.error(message);
  const [conversation, setConversation] = useState(props.conversation);
  const [optimisticInputMessage, setOptimisticInputMessage] =
    useState<Message | null>(null);
  const [streamingOutputMessage, setStreamingOutputMessage] =
    useState<Message | null>(null);

  const iterable_update = api.conversation.update.useMutation({
    onSuccess: async (it) => {
      for await (const value of it) {
        if (typeof value === "string") {
          setStreamingOutputMessage((prev) => ({
            ...(prev ?? makeFakeOutput(value, "ASSISTANT")),
            content: `${prev?.content ?? ""} ${value}`,
          }));
        } else {
          const { input, output } = value;
          setOptimisticInputMessage(null);
          setStreamingOutputMessage(null);
          setConversation({
            ...conversation!,
            messages: [...conversation!.messages, input, output],
          });
        }
      }
    },
    onError,
  });

  const iterable_create = api.conversation.create.useMutation({
    onSuccess: async (it) => {
      for await (const value of it) {
        if (typeof value === "string") {
          setStreamingOutputMessage((prev) => ({
            ...(prev ?? makeFakeOutput(value, "ASSISTANT")),
            content: `${prev?.content ?? ""} ${value}`,
          }));
        } else {
          const { conversation } = value;
          setOptimisticInputMessage(null);
          setStreamingOutputMessage(null);
          setConversation(conversation);
          window.history.pushState({}, "", `/${conversation.id}`);
        }
      }
    },
    onError,
  });

  useEffect(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, [conversation, optimisticInputMessage, streamingOutputMessage]);

  const onSubmit = async (content: string) => {
    // optimistically add
    setOptimisticInputMessage(makeFakeOutput(content, "USER"));
    if (conversation) {
      return await iterable_update.mutateAsync({
        content,
        convId: conversation.id,
      });
    } else {
      return await iterable_create.mutateAsync({ content });
    }
  };

  return (
    <div className="grid h-full grow grid-rows-[1fr_max-content_max-content] gap-4">
      <T3Description />
      <div className="flex flex-col gap-2">
        {[
          ...(conversation?.messages ?? []),
          optimisticInputMessage,
          streamingOutputMessage,
        ].map((msg) => msg && <BubbleMessage key={msg.id} {...msg} />)}
      </div>
      <QueryTextArea onSubmit={onSubmit} />
    </div>
  );
}
