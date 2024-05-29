"use client";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { api } from "~/trpc/react";
import { QueryTextArea } from "./_components/queryTextArea";
import { T3Description } from "./_components/t3Description";

export default function Home() {
  const notifyError = (text: string) => toast.error(text);
  const router = useRouter();
  const create = api.conversation.create.useMutation({
    onSuccess: (it) => {
      // router.push(`/${it.conversation!.id}`);
      router.replace(`/${it.conversation!.id}`);
    },
    onError: (it) => {
      notifyError(it.message);
    },
  });

  return (
    <div className="grid grow grid-rows-[1fr_max-content_max-content] gap-4">
      <T3Description />
      <QueryTextArea
        onSubmit={(content: string) => create.mutateAsync({ content })}
      />
    </div>
  );
}
