"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      login(token);
      router.replace("/dashboard");
    } else {
      router.replace("/");
    }
  }, [searchParams, login, router]);

  return (
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Signing you in...</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Signing you in...</p>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
