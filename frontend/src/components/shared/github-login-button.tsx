"use client";

import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { API_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface GitHubLoginButtonProps {
  size?: "default" | "lg";
  className?: string;
}

export function GitHubLoginButton({
  size = "default",
  className,
}: GitHubLoginButtonProps) {
  return (
    <Button
      asChild
      size={size}
      className={cn(
        "gap-2 font-medium",
        size === "lg" && "h-12 px-8 text-base",
        className
      )}
    >
      <a href={`${API_URL}/api/auth/github`}>
        <Github className="h-5 w-5" />
        Login with GitHub
      </a>
    </Button>
  );
}
