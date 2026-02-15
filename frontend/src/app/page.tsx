"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { GitHubLoginButton } from "@/components/shared/github-login-button";
import { Activity } from "lucide-react";

function LandingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      login(token);
      router.replace("/dashboard");
      return;
    }
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [searchParams, login, isAuthenticated, isLoading, router]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <Activity className="h-5 w-5 text-primary" />
            DevPulse
          </div>
          <GitHubLoginButton />
        </div>
      </header>

      <main className="flex-1">
        <Hero />
        <Features />
      </main>

      <Footer />
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense>
      <LandingContent />
    </Suspense>
  );
}
