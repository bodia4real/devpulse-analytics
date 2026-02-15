import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-1 h-4 w-48" />
      </div>
      <div className="mx-auto w-full max-w-[600px]">
        <Skeleton className="h-[340px] rounded-2xl" />
      </div>
    </div>
  );
}
