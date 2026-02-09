"use client";

import NavLink from "./NavLink";
import { NAV_ITEMS } from "@/lib/constants";

export default function BottomNav() {
  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card flex justify-around items-center h-16 z-40"
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map((item) => (
        <NavLink key={item.href} {...item} />
      ))}
    </nav>
  );
}
