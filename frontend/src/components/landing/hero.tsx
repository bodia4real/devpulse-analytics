"use client";

import { GitHubLoginButton } from "@/components/shared/github-login-button";
import { Activity } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />

      <div className="flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground mb-8">
        <Activity className="h-4 w-4" />
        <span>GitHub Analytics Dashboard</span>
      </div>

      <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        Your GitHub contributions,{" "}
        <span className="bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
          beautifully visualized
        </span>
      </h1>

      <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
        Track repositories, analyze contributions, and understand your coding
        patterns — all in one clean dashboard.
      </p>

      <div className="mt-10">
        <GitHubLoginButton size="lg" />
      </div>

      <div className="mt-16 w-full max-w-4xl rounded-xl border bg-card/50 p-1 shadow-2xl shadow-primary/5">
        <div className="rounded-lg bg-muted/30 p-8">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Repositories", value: "47" },
              { label: "Total Stars", value: "1.2k" },
              { label: "Contributions", value: "892" },
              { label: "Pull Requests", value: "156" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold sm:text-3xl">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex h-24 items-end gap-1">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-primary/20"
                style={{
                  height: `${20 + Math.sin(i * 0.5) * 30 + Math.random() * 50}%`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
