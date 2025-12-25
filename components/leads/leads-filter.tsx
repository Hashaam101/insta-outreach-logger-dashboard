"use client"

import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function LeadsFilter() {
  const searchParams = useSearchParams()
  const { replace } = useRouter()
  const pathname = "/leads"
  const initialQuery = searchParams.get("q")?.toString() || ""
  const [value, setValue] = useState(initialQuery)

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set("q", term)
    } else {
      params.delete("q")
    }
    replace(`${pathname}?${params.toString()}`)
  }, 300)

  const handleClear = () => {
    setValue("")
    const params = new URLSearchParams(searchParams)
    params.delete("q")
    replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="relative w-full sm:w-72">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search leads..."
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          handleSearch(e.target.value)
        }}
        className="pl-9 pr-9 h-9 bg-background/50 border-primary/10 focus-visible:ring-primary/20"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-transparent"
          onClick={handleClear}
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      )}
    </div>
  )
}
