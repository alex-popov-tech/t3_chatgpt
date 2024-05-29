import { type ROLE } from "@prisma/client";

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
  return (
    <div
      className={`w-fit max-w-[50%] rounded-lg bg-gray-700 p-2 text-white ${role === "USER" ? "ml-auto" : "mr-auto"}`}
    >
      {content.split("\n").map((chunk) => (
        <p key={`${id} ${chunk}`}>{chunk}</p>
      ))}
    </div>
  );
}
