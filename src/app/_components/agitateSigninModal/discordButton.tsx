"use client";
import { FaDiscord } from "react-icons/fa6";
import { signIn } from "next-auth/react";

const bg = "bg-[#5865F2] hover:bg-[#4855D1] active:bg-[#4855D1]";
const position = "grid grid-cols-[1fr_auto_1fr] place-items-center gap-3";
const size = "h-16 w-76";
const border = "rounded-2xl border-2";

export const DiscordButton = () => (
  <button
    className={`${bg} ${position} ${size} ${border} px-4 py-3`}
    onClick={() => signIn("discord")}
  >
    <FaDiscord className="size-7 text-white" />
    <span className="text-xl text-white">Sign in with Discord</span>
  </button>
);
