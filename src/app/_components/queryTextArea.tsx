"use client";
import { FaSpinner } from "react-icons/fa6";
import { useState } from "react";
import { api } from "~/trpc/react";
// const { isLoading, isError, data, error } = api.chat.test.useQuery();
// console.log({ isLoading, isError, data, error });
// useEffect(() => {
//   void (async () => {
//     console.log("USEEFFECT");
//     if (data) {
//       console.log("DATA FOUND");
//       for await (const it of data) {
//         console.log(it);
//       }
//     }
//     console.log("USEEFFECT END");
//   })();
// }, [data]);

export function QueryTextArea(props: {
  onSubmit: (content: string) => Promise<unknown>;
}) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const onSubmit = async () => {
    const content = text;
    setIsSubmitting(true);
    await props.onSubmit(content);
    setText("");
    setIsSubmitting(false);
  };

  return (
    <form className="flex h-24 gap-3 text-white">
      <textarea
        name="content"
        disabled={isSubmitting}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your query here..."
        className={`w-full rounded-md border border-gray-300 bg-inherit p-2 outline-none ${isSubmitting ? "cursor-not-allowed" : ""}`}
        value={isSubmitting ? "Please wait..." : text}
      ></textarea>
      <button
        disabled={isSubmitting}
        onClick={onSubmit}
        className={`grid w-32 place-items-center rounded-xl bg-gray-700 px-5 text-2xl ${isSubmitting ? "cursor-not-allowed" : ""}`}
      >
        {isSubmitting ? (
          <span className="animate-spin text-4xl">
            <FaSpinner />
          </span>
        ) : (
          <span>Submit</span>
        )}
      </button>
    </form>
  );
}
