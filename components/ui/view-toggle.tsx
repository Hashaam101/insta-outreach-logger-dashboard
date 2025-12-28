"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Users, Loader2 } from "lucide-react"
import { setViewCookie } from "@/app/actions/ui"

export function ViewToggle() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentView = searchParams.get("view") || "my"
  const [isPending, startTransition] = React.useTransition()

  const setView = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("view", value)
    
    startTransition(() => {
        // Persist preference
        setViewCookie(value);
        router.push(`?${params.toString()}`)
    })
  }

  return (
    <div className="flex items-center gap-4 bg-card/40 p-1 rounded-2xl border border-primary/10 backdrop-blur-sm relative">
      <Tabs value={currentView} onValueChange={setView} className="w-auto">
        <TabsList className={`bg-transparent h-9 gap-1 ${isPending ? 'animate-pulse opacity-70' : ''}`}>
          <TabsTrigger 
            value="my" 
            disabled={isPending}
            className="text-[10px] h-7 px-4 gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all"
          >
            <User className="h-3 w-3" />
            My View
          </TabsTrigger>
          <TabsTrigger 
            value="team" 
            disabled={isPending}
            className="text-[10px] h-7 px-4 gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all"
          >
            <Users className="h-3 w-3" />
            Team View
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}