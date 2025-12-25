import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 md:space-y-10 pb-10 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
            <Skeleton className="h-3 w-32 bg-primary/10" />
            <Skeleton className="h-10 w-64 md:w-80 rounded-xl" />
            <Skeleton className="h-4 w-48 md:w-96" />
        </div>
        <div className="flex gap-3">
            <Skeleton className="h-9 w-32 rounded-2xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>
      
      {/* Stats Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-primary/10 bg-card/40 border-2 rounded-2xl">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-10 w-10 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-7 space-y-6">
            <Card className="border-primary/10 bg-card/40 border-2 rounded-2xl h-[180px]">
                <CardHeader className="pb-3 border-b border-primary/5 bg-primary/5">
                    <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-3 w-20" /></div>
                        <div className="space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-3 w-20" /></div>
                    </div>
                </CardContent>
            </Card>
            <Card className="border-primary/10 bg-card/40 border-2 rounded-2xl h-[350px]">
                <CardHeader className="pb-3 border-b border-primary/5 bg-primary/5">
                    <Skeleton className="h-5 w-48" />
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                </CardContent>
            </Card>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-5 space-y-6">
            <Card className="border-primary/10 bg-card/40 border-2 rounded-2xl h-[280px]">
                <CardHeader className="pb-3 border-b border-primary/5 bg-primary/5">
                    <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
                </CardContent>
            </Card>
            <Card className="border-primary/10 bg-card/40 border-2 rounded-2xl h-[280px]">
                <CardHeader className="pb-3 border-b border-primary/5 bg-primary/5">
                    <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}