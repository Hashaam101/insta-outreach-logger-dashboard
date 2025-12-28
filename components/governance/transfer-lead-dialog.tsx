"use client"

import * as React from "react"
import { Instagram, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { transferLead } from "@/app/actions/governance"
import { getActors } from "@/app/(dashboard)/leads/actions"
import { toast } from "sonner"

interface TransferLeadDialogProps {
  targetUsername: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function TransferLeadDialog({ targetUsername, open, onOpenChange }: TransferLeadDialogProps) {
  const [actors, setActors] = React.useState<{ USERNAME: string }[]>([])
  const [isPending, setIsPending] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (open && actors.length === 0) {
      const fetchActors = async () => {
        setIsLoading(true)
        const data = await getActors()
        setActors(data)
        setIsLoading(false)
      }
      fetchActors()
    }
  }, [open, actors.length])

  const handleTransfer = async (newActor: string) => {
    setIsPending(true)
    const res = await transferLead(targetUsername, newActor)
    if (res.success) {
      toast.success("Lead Transferred", {
        description: `${targetUsername} moved to actor ${newActor}`
      })
      onOpenChange?.(false)
    } else {
      toast.error(res.error || "Transfer failed")
    }
    setIsPending(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transfer {targetUsername}</DialogTitle>
          <DialogDescription>
            Move this prospect to a different Instagram actor account.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Command className="rounded-lg border border-primary/10 bg-card/40">
            <CommandInput placeholder="Search active actors..." />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Loading accounts..." : "No active actors found."}
              </CommandEmpty>
              <CommandGroup heading="Active Instagram Accounts">
                {actors.map((actor) => (
                  <CommandItem
                    key={actor.USERNAME}
                    value={actor.USERNAME}
                    onSelect={(val) => handleTransfer(val)}
                    className="flex items-center gap-2 py-3 cursor-pointer"
                  >
                    <div className="bg-primary/10 p-1.5 rounded-md">
                        <Instagram className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="font-medium">{actor.USERNAME}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
        {isPending && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center rounded-lg">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}