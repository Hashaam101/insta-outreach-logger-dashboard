"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { FacetedFilter } from "@/components/ui/faceted-filter"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Search, Settings2, Check, Loader2 } from "lucide-react"
import { useDebouncedCallback } from "use-debounce"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface ActorsToolbarProps {
  operators: { label: string; value: string }[]
  handles: { label: string; value: string }[]
  initialPrefs: {
      metric1: string;
      range1: string;
      metric2: string;
      range2: string;
      endpoint?: string;
  }
}

const STATUS_OPTIONS = [
    { label: "Active", value: "Active" },
    { label: "Suspended By Team", value: "Suspended By Team" },
    { label: "Suspended By Insta", value: "Suspended By Insta" },
    { label: "Discarded", value: "Discarded" },
]

const METRIC_OPTIONS = [
    { label: "Total Messages", value: "DMS" },
    { label: "Profiles Contacted", value: "TARGETS" },
    { label: "Replies Received", value: "REPLIES" },
    { label: "Warm Leads", value: "WARM" },
    { label: "Bookings Made", value: "BOOKED" },
    { label: "Payments", value: "PAID" },
]

const RANGE_OPTIONS = [
    { label: "Today", value: "Today" },
    { label: "This Week", value: "This Week" },
    { label: "This Month", value: "This Month" },
    { label: "All Time", value: "All Time" },
]

export function ActorsToolbar({ operators, handles, initialPrefs }: ActorsToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = React.useState(searchParams.get("q") || "")
  const [isPending, startTransition] = React.useTransition()
  
  // Local state for prefs before saving
  const [prefs, setPrefs] = React.useState(initialPrefs)

  const selectedStatuses = new Set(searchParams.get("statuses")?.split(",") || [])
  const selectedOperators = new Set(searchParams.get("operators")?.split(",") || [])
  const selectedHandles = new Set(searchParams.get("handles")?.split(",") || [])

  const updateUrl = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Correct redirection based on current path
    const path = window.location.pathname;
    router.replace(`${path}?${params.toString()}`)
  }

  const handleSearch = useDebouncedCallback((term: string) => {
    updateUrl("q", term)
  }, 300)

  const handleFilterChange = (key: string, values: Set<string>) => {
    const valString = Array.from(values).join(",")
    updateUrl(key, valString || null)
  }

  const resetFilters = () => {
    const path = window.location.pathname;
    router.replace(path)
    setQuery("")
  }

  const savePrefs = async () => {
      try {
        const response = await fetch(prefs.endpoint || '/api/prefs', {
            method: 'POST',
            body: JSON.stringify(prefs)
        });
        
        if (response.ok) {
            startTransition(() => {
                toast.success("Display preferences saved");
                router.refresh(); 
            });
        } else {
            toast.error("Failed to save preferences");
        }
      } catch (_error) {
        toast.error("Failed to save preferences");
      }
  }

  const isFiltered = query || selectedStatuses.size > 0 || selectedOperators.size > 0 || selectedHandles.size > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/50" />
            <Input
              placeholder="Search..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                handleSearch(e.target.value)
              }}
              className="h-9 w-full pl-9 rounded-xl bg-card border-primary/5"
            />
        </div>
        
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
            title="Handles"
            options={handles}
            selectedValues={selectedHandles}
            onSelect={(vals) => handleFilterChange("handles", vals)}
        />

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={resetFilters}
            className="h-8 px-2 lg:px-3 text-muted-foreground hover:text-foreground"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}

        <div className="flex-1" />

        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 rounded-xl border-primary/10 gap-2">
                    <Settings2 className="h-4 w-4 text-primary" />
                    <span className="hidden sm:inline">Display Settings</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-4 rounded-2xl bg-card/95 backdrop-blur-xl border-primary/10 shadow-2xl" align="end">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <h4 className="font-bold text-sm">Preview Configuration</h4>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Set your card metrics</p>
                    </div>
                    
                    <div className="grid gap-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-extrabold text-primary uppercase ml-1 tracking-widest">Box 1 (Account Total)</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-muted-foreground uppercase ml-1">Metric</label>
                                    <Select value={prefs.metric1} onValueChange={(v) => setPrefs(prev => ({...prev, metric1: v}))}>
                                        <SelectTrigger className="h-9 rounded-xl bg-background border-primary/5 text-xs w-full">
                                            <SelectValue className="truncate" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {METRIC_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-muted-foreground uppercase ml-1">Window</label>
                                    <Select value={prefs.range1} onValueChange={(v) => setPrefs(prev => ({...prev, range1: v}))}>
                                        <SelectTrigger className="h-9 rounded-xl bg-background border-primary/5 text-xs w-full">
                                            <SelectValue className="truncate" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {RANGE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-extrabold text-primary uppercase ml-1 tracking-widest">Box 2 (Top Item)</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-muted-foreground uppercase ml-1">Metric</label>
                                    <Select value={prefs.metric2} onValueChange={(v) => setPrefs(prev => ({...prev, metric2: v}))}>
                                        <SelectTrigger className="h-9 rounded-xl bg-background border-primary/5 text-xs w-full">
                                            <SelectValue className="truncate" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {METRIC_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-muted-foreground uppercase ml-1">Window</label>
                                    <Select value={prefs.range2} onValueChange={(v) => setPrefs(prev => ({...prev, range2: v}))}>
                                        <SelectTrigger className="h-9 rounded-xl bg-background border-primary/5 text-xs w-full">
                                            <SelectValue className="truncate" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {RANGE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button 
                        onClick={savePrefs} 
                        disabled={isPending}
                        className="w-full h-10 rounded-xl font-bold shadow-lg shadow-primary/20 gap-2 mt-2"
                    >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        {isPending ? "Saving..." : "Save Preferences"}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
