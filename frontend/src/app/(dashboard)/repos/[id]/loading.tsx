import { Skeleton } from "@/components/ui/skeleton";

export default function RepoDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-32" />
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-1 h-4 w-48" />
        <Skeleton className="mt-3 h-16 w-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
    </div>
  );
}
