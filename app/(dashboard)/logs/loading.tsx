import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function LogsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-card/40 p-4 rounded-2xl border border-primary/10">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <Skeleton className="h-10 w-full md:w-64 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* Table Skeleton */}
      <Card className="border-primary/10 bg-card/40 border-2 overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <div className="flex items-center gap-4 p-4 border-b border-primary/10 bg-primary/5">
            {[60, 100, 100, 200, 120, 80].map((w, i) => (
              <Skeleton key={i} className="h-4" style={{ width: w }} />
            ))}
          </div>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-primary/5">
              <Skeleton className="h-4 w-12" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-48 flex-1" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-8 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
