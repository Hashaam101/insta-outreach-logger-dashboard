"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { FacetedFilter } from "@/components/ui/faceted-filter"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Search } from "lucide-react"
import { useDebouncedCallback } from "use-debounce"

interface LeadsToolbarProps {
  operators: { label: string; value: string }[]
  actors: { label: string; value: string }[]
}

const STATUS_OPTIONS = [
    { label: "Cold No Reply", value: "Cold No Reply" },
    { label: "Replied", value: "Replied" },
    { label: "Warm", value: "Warm" },
    { label: "Booked", value: "Booked" },
    { label: "Paid", value: "Paid" },
    { label: "Client", value: "Tableturnerr Client" },
    { label: "Excluded", value: "Excluded" },
]

const TIME_RANGE_OPTIONS = [
    { label: "Today", value: "Today" },
    { label: "This Week", value: "This Week" },
    { label: "This Month", value: "This Month" },
    { label: "All Time", value: "All Time" },
]

export function LeadsToolbar({ operators, actors }: LeadsToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = React.useState(searchParams.get("q") || "")

  // Sync state with URL
  const selectedStatuses = new Set(searchParams.get("statuses")?.split(",") || [])
  const selectedOperators = new Set(searchParams.get("operators")?.split(",") || [])
  const selectedActors = new Set(searchParams.get("actors")?.split(",") || [])
  const selectedRange = new Set(searchParams.get("timeRange")?.split(",") || [])

  const updateUrl = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Reset page on filter change
    if (key !== "page") params.delete("page")
    
    router.replace(`/leads?${params.toString()}`)
  }

  // Debounced search update
  const handleSearch = useDebouncedCallback((term: string) => {
    updateUrl("q", term)
  }, 300)

  const handleFilterChange = (key: string, values: Set<string>) => {
    const valString = Array.from(values).join(",")
    updateUrl(key, valString || null)
  }

  const resetFilters = () => {
    router.replace("/leads")
    setQuery("")
  }

  const isFiltered = query || selectedStatuses.size > 0 || selectedOperators.size > 0 || selectedActors.size > 0 || selectedRange.size > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                handleSearch(e.target.value)
              }}
              className="h-8 w-full pl-8 rounded-xl bg-card"
            />
        </div>
        
        <FacetedFilter
            title="Time Range"
            options={TIME_RANGE_OPTIONS}
            selectedValues={selectedRange}
            onSelect={(vals) => handleFilterChange("timeRange", vals)}
        />

        <FacetedFilter
            title="Status"
            options={STATUS_OPTIONS}
            selectedValues={selectedStatuses}
            onSelect={(vals) => handleFilterChange("statuses", vals)}
        />
        
        <div className="h-6 w-px bg-border mx-2 hidden md:block" />

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
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}