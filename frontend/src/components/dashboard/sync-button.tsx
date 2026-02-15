"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface SyncButtonProps {
  onClick: () => void;
  isPending: boolean;
  label?: string;
  className?: string;
}

export function SyncButton({
  onClick,
  isPending,
  label = "Sync from GitHub",
  className,
}: SyncButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={isPending}
      className={cn("gap-2", className)}
    >
      <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
      {isPending ? "Syncing..." : label}
    </Button>
  );
}
