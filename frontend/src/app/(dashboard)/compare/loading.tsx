import { Skeleton } from "@/components/ui/skeleton";

export default function CompareLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-1 h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}
