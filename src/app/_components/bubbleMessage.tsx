import { clsx } from "clsx";
import { type ROLE } from "@prisma/client";
import { format } from "date-fns";

export function BubbleMessage({
  id,
  role,
  content,
  createdAt,
}: {
  id: number;
  role: ROLE;
  content: string;
  createdAt: Date;
}) {
  const prettyRole = role === "USER" ? "You" : "ChatGPT";
  return (
    <div
      className={clsx(
        "flex flex-col gap-1",
        role === "USER" ? "ml-auto" : "mr-auto",
        "w-fit max-w-[50%] ",
        "rounded-lg bg-gray-700 p-2 text-white",
      )}
    >
      <div className="flex justify-between gap-3 text-gray-500">
        <span className="text-[0.75rem] leading-[0.5rem]">{prettyRole}</span>
        <span className="text-[0.75rem] leading-[0.5rem]">
          {format(createdAt, "yyyy/mm/dd HH:mm")}
        </span>
      </div>
      {content
        .split("\n")
        .filter((it) => it)
        .map((chunk) => (
          <p key={`${id} ${chunk}`}>{`  ${chunk}`}</p>
        ))}
    </div>
  );
}
