"use client";

import { signOut } from "next-auth/react";

export const SignOutButton = () => (
  <button
    onClick={() => signOut()}
    className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
  >
    Sign out
  </button>
);
