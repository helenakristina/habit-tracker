"use client";

import NavLink from "./NavLink";
import { NAV_ITEMS } from "@/lib/constants";

export default function TopNav() {
  return (
    <header className="hidden sm:flex items-center justify-between border-b border-border bg-card px-6 h-14">
      <div className="flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span className="font-semibold text-foreground">Habit Tracker</span>
      </div>
      <nav className="flex items-center gap-1" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>
    </header>
  );
}
