"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  label: string;
  icon: "dashboard" | "habits" | "settings";
}

function NavIcon({ icon, className }: { icon: NavLinkProps["icon"]; className?: string }) {
  switch (icon) {
    case "dashboard":
      return (
        <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="6" height="6" rx="1" />
          <rect x="11" y="3" width="6" height="6" rx="1" />
          <rect x="3" y="11" width="6" height="6" rx="1" />
          <rect x="11" y="11" width="6" height="6" rx="1" />
        </svg>
      );
    case "habits":
      return (
        <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 10l4 4 8-8" />
        </svg>
      );
    case "settings":
      return (
        <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="10" r="3" />
          <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41" />
        </svg>
      );
  }
}

export default function NavLink({ href, label, icon }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        min-h-[44px] min-w-[44px] justify-center sm:justify-start
        ${isActive
          ? "text-primary bg-accent"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      aria-current={isActive ? "page" : undefined}
    >
      <NavIcon icon={icon} />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden text-xs">{label}</span>
    </Link>
  );
}
