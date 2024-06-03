"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export const SignOutButton = () => {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await signOut();
        router.replace("/");
      }}
      className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
    >
      Sign out
    </button>
  );
};
