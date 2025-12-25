"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "lucide-react"

const RANGE_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "14", label: "Last 14 days" },
  { value: "30", label: "Last 30 days" },
  { value: "60", label: "Last 60 days" },
  { value: "90", label: "Last 90 days" },
  { value: "180", label: "Last 6 months" },
  { value: "365", label: "Last year" },
]

export function EnrichmentFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentRange = searchParams.get("enrichmentRange") || "30"

  const setRange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("enrichmentRange", value)
    router.push(`/analytics?${params.toString()}`)
  }

  const selectedOption = RANGE_OPTIONS.find(o => o.value === currentRange)

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-primary" />
      <Select value={currentRange} onValueChange={setRange}>
        <SelectTrigger className="w-[160px] h-8 text-xs bg-background/50 border-primary/20">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          {RANGE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-xs">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
