"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2, AlertTriangle, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { setOperatorName } from "./actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Operator {
    name: string;
    isClaimed: boolean;
}

export function OnboardingForm({ initialOperators }: { initialOperators: Operator[] }) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  const [searchValue, setSearchValue] = React.useState("")
  const [isPending, setIsPending] = React.useState(false)
  const router = useRouter()

  const operators = initialOperators;
  
  // Find selected operator
  const selectedOperator = operators.find((op) => op.name.toLowerCase() === value.toLowerCase())

  const handleSelect = async (name: string) => {
    setIsPending(true)
    const res = await setOperatorName(name)
    if (res.success) {
      toast.success("Identity established!")
      router.refresh()
      router.push("/")
    } else {
      toast.error(res.error || "Failed to update identity")
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Choose or Create Identity
        </label>
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
            <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between h-12 bg-background/50 border-primary/20 hover:border-primary/40 text-lg"
                disabled={isPending}
            >
                {value ? value : "Select operator..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command>
                <CommandInput 
                    placeholder="Search operators..." 
                    onValueChange={setSearchValue}
                />
                <CommandList>
                <CommandEmpty className="p-4">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <UserPlus className="h-8 w-8 text-primary opacity-50" />
                        <p className="text-sm font-medium">No operator found for &quot;{searchValue}&quot;</p>
                        <Button 
                            size="sm" 
                            className="mt-2"
                            onClick={() => {
                                setValue(searchValue)
                                setOpen(false)
                            }}
                        >
                            Create &quot;{searchValue}&quot;
                        </Button>
                    </div>
                </CommandEmpty>
                <CommandGroup heading="Existing Operators">
                    {operators.map((op) => (
                    <CommandItem
                        key={op.name}
                        value={op.name}
                        disabled={op.isClaimed}
                        onSelect={(currentValue) => {
                            setValue(currentValue)
                            setOpen(false)
                        }}
                        className="flex items-center justify-between py-3"
                    >
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "h-2 w-2 rounded-full",
                                op.isClaimed ? "bg-muted" : "bg-green-500"
                            )} />
                            <span className={cn(op.isClaimed && "text-muted-foreground line-through")}>
                                {op.name}
                            </span>
                        </div>
                        {op.isClaimed && <span className="text-[10px] uppercase font-bold text-muted-foreground">Claimed</span>}
                        {value === op.name && <Check className="h-4 w-4 text-primary" />}
                    </CommandItem>
                    ))}
                </CommandGroup>
                </CommandList>
            </Command>
            </PopoverContent>
        </Popover>
      </div>

      {value && !selectedOperator && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3 text-amber-500">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div className="text-sm">
                  <p className="font-bold">New Identity Detection</p>
                  <p className="opacity-80">You are creating a new operator identity: <strong>{value}</strong>. This action is permanent and cannot be changed later.</p>
              </div>
          </div>
      )}

      {selectedOperator && (
          <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex gap-3 text-primary">
              <Check className="h-5 w-5 shrink-0" />
              <div className="text-sm">
                  <p className="font-bold">Existing Identity</p>
                  <p className="opacity-80">You are claiming the existing identity: <strong>{value}</strong>.</p>
              </div>
          </div>
      )}

      <Button 
        className="w-full h-12 text-lg font-bold" 
        disabled={!value || isPending}
        onClick={() => handleSelect(value)}
      >
        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm & Access Dashboard"}
      </Button>
    </div>
  )
}
