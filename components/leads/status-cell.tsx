"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

import { updateLeadStatus } from "@/app/(dashboard)/leads/actions"

interface StatusCellProps {
  status: string
  username: string
}

export function StatusCell({ status: initialStatus, username }: StatusCellProps) {
  const [status, setStatus] = useState(initialStatus)
  const [isPending, setIsPending] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    const originalStatus = status;
    setStatus(newStatus);
    setIsPending(true);
    
    try {
        await updateLeadStatus(username, newStatus);
    } catch (error) {
        console.error("Failed to update status", error);
        setStatus(originalStatus); // Revert on error
    } finally {
        setIsPending(false);
    }
  }

  let color = "secondary"
  if (status === "Contacted") color = "default"
  if (status === "Reply Received") color = "outline"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="cursor-pointer flex items-center gap-1">
            <Badge variant={color as any} className={isPending ? "opacity-50" : ""}>
                {status}
            </Badge>
            <ChevronDown className="h-3 w-3 opacity-50" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => handleStatusChange("Not Contacted")}>
          Not Contacted
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("Contacted")}>
          Contacted
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("Reply Received")}>
          Reply Received
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("Booked")}>
          Booked
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
