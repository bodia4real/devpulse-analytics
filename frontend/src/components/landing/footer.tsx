import { Activity } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4" />
          <span>DevPulse Analytics</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Built with Next.js, TypeScript &amp; the GitHub API
        </p>
      </div>
    </footer>
  );
}
