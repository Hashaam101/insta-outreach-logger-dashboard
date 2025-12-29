"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { FacetedFilter } from "@/components/ui/faceted-filter"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Search } from "lucide-react"
import { useDebouncedCallback } from "use-debounce"

interface LogsToolbarProps {
  operators: { label: string; value: string }[]
  actors: { label: string; value: string }[]
}

const EVENT_TYPES = [
    { label: "Outreach", value: "Outreach" },
    { label: "Info Change", value: "Change in Tar Info" },
    { label: "Exceptions", value: "Tar Exception Toggle" },
    { label: "User", value: "User" },
    { label: "System", value: "System" },
]

const TIME_RANGE_OPTIONS = [
    { label: "Today", value: "Today" },
    { label: "This Week", value: "This Week" },
    { label: "This Month", value: "This Month" },
    { label: "All Time", value: "All Time" },
]

export function LogsToolbar({ operators, actors }: LogsToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = React.useState(searchParams.get("q") || "")

  const selectedOperators = new Set(searchParams.get("operators")?.split(",") || [])
  const selectedActors = new Set(searchParams.get("actors")?.split(",") || [])
  const selectedTypes = new Set(searchParams.get("types")?.split(",") || [])
  const selectedRange = new Set(searchParams.get("timeRange")?.split(",") || [])

  const updateUrl = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    if (key !== "page") params.delete("page")
    router.replace(`/logs?${params.toString()}`)
  }

  const handleSearch = useDebouncedCallback((term: string) => {
    updateUrl("q", term)
  }, 300)

  const handleFilterChange = (key: string, values: Set<string>) => {
    const valString = Array.from(values).join(",")
    updateUrl(key, valString || null)
  }

  const resetFilters = () => {
    router.replace("/logs")
    setQuery("")
  }

  const isFiltered = query || selectedOperators.size > 0 || selectedActors.size > 0 || selectedTypes.size > 0 || selectedRange.size > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full md:flex-1 md:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/50" />
            <Input
              placeholder="Search logs..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                handleSearch(e.target.value)
              }}
              className="h-9 w-full pl-9 rounded-xl bg-card border-primary/5"
            />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
            <FacetedFilter
                title="Time Range"
                options={TIME_RANGE_OPTIONS}
                selectedValues={selectedRange}
                onSelect={(vals) => handleFilterChange("timeRange", vals)}
            />

            <FacetedFilter
                title="Event Type"
                options={EVENT_TYPES}
                selectedValues={selectedTypes}
                onSelect={(vals) => handleFilterChange("types", vals)}
            />

            <div className="h-6 w-px bg-border mx-1 hidden md:block" />

            <FacetedFilter
                title="Operators"
                options={operators}
                selectedValues={selectedOperators}
                onSelect={(vals) => handleFilterChange("operators", vals)}
            />

            <FacetedFilter
                title="Actors"
                options={actors}
                selectedValues={selectedActors}
                onSelect={(vals) => handleFilterChange("actors", vals)}
            />

            {isFiltered && (
              <Button
                variant="ghost"
                onClick={resetFilters}
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                Reset
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
        </div>
      </div>
    </div>
  )
}
