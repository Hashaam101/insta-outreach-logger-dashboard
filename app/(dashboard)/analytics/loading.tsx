import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
            <Skeleton className="h-3 w-32 bg-primary/10" />
            <Skeleton className="h-10 w-64 md:w-80 rounded-xl" />
            <Skeleton className="h-4 w-48 md:w-96" />
        </div>
        <Skeleton className="h-10 w-48 rounded-2xl" />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        <Card className="col-span-1 lg:col-span-8 border-primary/10 bg-card/40 border-2 rounded-2xl h-[400px]">
          <CardHeader className="border-b border-primary/5 bg-primary/5">
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="p-6">
            <Skeleton className="h-full w-full rounded-xl" />
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-4 border-primary/10 bg-card/40 border-2 rounded-2xl h-[400px]">
          <CardHeader className="border-b border-primary/5">
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="p-6">
            <Skeleton className="h-full w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-12">
        {[1, 2].map((i) => (
          <Card key={i} className="col-span-1 lg:col-span-6 border-primary/10 bg-card/40 border-2 rounded-2xl h-[350px]">
            <CardHeader className="border-b border-primary/5">
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="p-6">
              <Skeleton className="h-full w-full rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/10 bg-card/40 border-2 rounded-2xl h-[250px]">
          <CardHeader className="border-b border-primary/5 bg-primary/5">
              <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="p-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex flex-col items-center gap-4">
                          <Skeleton className="h-16 w-16 rounded-3xl" />
                          <Skeleton className="h-8 w-20" />
                      </div>
                  ))}
              </div>
          </CardContent>
      </Card>
    </div>
  );
}