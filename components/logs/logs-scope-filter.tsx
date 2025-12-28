"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogsScopeFilterProps {
  operatorName?: string
}

export function LogsScopeFilter({ operatorName }: LogsScopeFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentScope = searchParams.get("scope") || "operator"
  const currentActor = searchParams.get("actor") || ""
  
  const [actorInput, setActorInput] = React.useState(currentActor)

  const handleScopeChange = (scope: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("scope", scope)
    params.delete("page") // Reset to page 1
    
    if (scope !== "actor") {
        params.delete("actor")
    }
    
    router.push(`?${params.toString()}`)
  }

  const handleActorSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!actorInput.trim()) return

    const params = new URLSearchParams(searchParams.toString())
    params.set("scope", "actor")
    params.set("actor", actorInput.trim())
    params.delete("page")
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-3 p-4 border border-primary/20 rounded-xl bg-primary/5">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
          Audit Scope
        </span>
      </div>
      
      <div className="flex flex-wrap items-center gap-4">
        {/* All Logs */}
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className={cn(
            "w-4 h-4 rounded-full border border-primary/50 flex items-center justify-center transition-colors",
            currentScope === "all" ? "bg-primary border-primary" : "group-hover:border-primary"
          )}>
            {currentScope === "all" && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
          </div>
          <input 
            type="radio" 
            name="scope" 
            value="all" 
            className="hidden"
            checked={currentScope === "all"}
            onChange={() => handleScopeChange("all")}
          />
          <span className={cn("text-sm", currentScope === "all" ? "font-bold text-primary" : "text-muted-foreground")}>
            All Logs
          </span>
        </label>

        {/* My Operator */}
        <label className="flex items-center gap-2 cursor-pointer group">
           <div className={cn(
            "w-4 h-4 rounded-full border border-primary/50 flex items-center justify-center transition-colors",
            currentScope === "operator" ? "bg-primary border-primary" : "group-hover:border-primary"
          )}>
            {currentScope === "operator" && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
          </div>
          <input 
            type="radio" 
            name="scope" 
            value="operator" 
            className="hidden"
            checked={currentScope === "operator"}
            onChange={() => handleScopeChange("operator")}
          />
          <span className={cn("text-sm", currentScope === "operator" ? "font-bold text-primary" : "text-muted-foreground")}>
            Operator: {operatorName || "Me"}
          </span>
        </label>

        {/* Specific Actor */}
        <label className="flex items-center gap-2 cursor-pointer group">
           <div className={cn(
            "w-4 h-4 rounded-full border border-primary/50 flex items-center justify-center transition-colors",
            currentScope === "actor" ? "bg-primary border-primary" : "group-hover:border-primary"
          )}>
            {currentScope === "actor" && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
          </div>
          <input 
            type="radio" 
            name="scope" 
            value="actor" 
            className="hidden"
            checked={currentScope === "actor"}
            onChange={() => handleScopeChange("actor")}
          />
          <span className={cn("text-sm", currentScope === "actor" ? "font-bold text-primary" : "text-muted-foreground")}>
            Specific Actor
          </span>
        </label>
      </div>

      {currentScope === "actor" && (
        <form onSubmit={handleActorSearch} className="flex gap-2 items-center mt-1 animate-in fade-in slide-in-from-top-1">
            <Input 
                placeholder="Enter actor username..." 
                value={actorInput}
                onChange={(e) => setActorInput(e.target.value)}
                className="h-8 text-xs w-[200px]"
            />
            <Button size="sm" variant="secondary" className="h-8 px-2" type="submit">
                <Search className="h-3 w-3" />
            </Button>
        </form>
      )}
    </div>
  )
}
