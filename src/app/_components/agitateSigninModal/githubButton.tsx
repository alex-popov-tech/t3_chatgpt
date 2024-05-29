"use client";
import { FaGithub } from "react-icons/fa6";
import { signIn } from "next-auth/react";

const bg = "bg-[#24292f] hover:bg-[#2d3339] active:bg-[#2d3339]";
const position = "grid grid-cols-[1fr_auto_1fr] place-items-center gap-3 ";
const size = "h-16 w-76";
const border = "rounded-2xl border-2";

export const GithubButton = () => (
  <button
    className={`${bg} ${position} ${size} ${border} px-4 py-3`}
    onClick={() => signIn("github")}
  >
    <FaGithub className="size-7 text-white" />
    <span className="text-xl text-white">Sign in with GitHub</span>
  </button>
);
