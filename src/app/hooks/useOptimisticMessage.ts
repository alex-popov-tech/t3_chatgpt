import { type Message } from "@prisma/client";
import { useState } from "react";

export const useOptimisticMessage = () => {
  const [optimisticMessage, setMessage] = useState<Message | null>(null);
  const setOptimisticMessage = ({ content }: { content: string }) =>
    setMessage({
      id: Date.now(),
      content,
      role: "USER",
      createdAt: new Date(),
      updatedAt: new Date(),
      conversationId: Number.MAX_VALUE,
    });
  const clearOptimisticMessage = () => setMessage(null);

  return { optimisticMessage, setOptimisticMessage, clearOptimisticMessage };
};
