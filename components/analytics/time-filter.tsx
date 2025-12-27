"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "lucide-react"

export function TimeFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentRange = searchParams.get("range") || "30"

  const setRange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("range", value)
    router.push(`/analytics?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-4 bg-card/50 backdrop-blur-md p-1.5 rounded-2xl border border-primary/10 shadow-lg">
        <div className="flex items-center gap-2 px-3 border-r border-primary/10">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Timeframe</span>
        </div>
      <Tabs value={currentRange} onValueChange={setRange} className="w-auto">
        <TabsList className="bg-transparent h-8">
          <TabsTrigger value="7" className="text-[10px] h-7 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">7D</TabsTrigger>
          <TabsTrigger value="30" className="text-[10px] h-7 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">30D</TabsTrigger>
          <TabsTrigger value="90" className="text-[10px] h-7 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">90D</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
