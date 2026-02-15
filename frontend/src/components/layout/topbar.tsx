"use client";

import { MobileNav } from "./mobile-nav";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme-toggle";

interface TopbarProps {
  title?: string;
}

export function Topbar({ title }: TopbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <MobileNav />
        {title && <h1 className="text-lg font-semibold">{title}</h1>}
      </div>
      <div className="flex items-center gap-2">
        <div className="lg:hidden">
          <ThemeToggle />
        </div>
        <UserMenu />
      </div>
    </header>
  );
}
