"use client";

import { ReactNode } from "react";
import TopNav from "./TopNav";
import BottomNav from "./BottomNav";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-4xl px-4 py-6 pb-20 sm:pb-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
