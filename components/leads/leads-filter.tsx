"use client"

import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"

export function LeadsFilter() {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = "/leads"; // Hardcoded for now or usePathname()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input
        placeholder="Filter by username..."
        defaultValue={searchParams.get("q")?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}
