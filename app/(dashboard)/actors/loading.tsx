import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ActorsLoading() {
  return (
    <div className="space-y-10 pb-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-52" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-48 rounded-2xl" />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-primary/10 bg-card/40 border-2">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-primary/10 bg-card/40 border-2">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
