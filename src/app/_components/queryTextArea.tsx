"use client";
import { FaSpinner } from "react-icons/fa6";
import { useState } from "react";

export function QueryTextArea(props: {
  onSubmit: (content: string) => Promise<unknown>;
}) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);

  const onChange = (text: string) => {
    setText(text);
    setIsError(!text.length);
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    await props.onSubmit(text).finally(() => setIsSubmitting(false));
    setText("");
  };

  return (
    <form className="flex h-24 gap-3 text-white">
      <textarea
        name="content"
        disabled={isSubmitting}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your query here..."
        className={`w-full rounded-md border ${isError ? "border-red-500" : "border-gray-300"} bg-inherit p-2 outline-none ${isSubmitting ? "cursor-not-allowed" : ""}`}
        value={isSubmitting ? "Please wait..." : text}
      ></textarea>
      <button
        disabled={isSubmitting || !text.length}
        onClick={onSubmit}
        className={`grid w-32 place-items-center rounded-xl bg-gray-700 px-5 text-2xl ${isSubmitting || !text.length ? "cursor-not-allowed" : ""}`}
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
