"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { ThemeToggle } from "./theme-toggle";
import {
  Activity,
  LayoutDashboard,
  FolderGit2,
  GitCommitHorizontal,
  UserCircle,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: ROUTES.dashboard,
    icon: LayoutDashboard,
  },
  {
    label: "Repositories",
    href: ROUTES.repos,
    icon: FolderGit2,
  },
  {
    label: "Contributions",
    href: ROUTES.contributions,
    icon: GitCommitHorizontal,
  },
  {
    label: "Profile",
    href: ROUTES.profile,
    icon: UserCircle,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r">
      <div className="flex h-16 items-center gap-2 border-b px-6 font-semibold">
        <Activity className="h-5 w-5 text-primary" />
        <span>DevPulse</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <ThemeToggle />
      </div>
    </aside>
  );
}
