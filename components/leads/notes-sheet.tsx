"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Save, Loader2 } from "lucide-react"
import { updateLeadNote, getLeadNote } from "@/app/(dashboard)/leads/actions"
import { toast } from "sonner"

interface NotesSheetProps {
  username: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function NotesSheet({ username, open, onOpenChange }: NotesSheetProps) {
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch note when sheet opens
  useEffect(() => {
      let isMounted = true;
      if (open) {
          const fetchNote = async () => {
              setIsLoading(true);
              try {
                  const data = await getLeadNote(username);
                  if (isMounted) setNote(data === "N/A" ? "" : data);
              } catch {
                  toast.error("Failed to load notes");
              } finally {
                  if (isMounted) setIsLoading(false);
              }
          };
          fetchNote();
      }
      return () => { isMounted = false; };
  }, [open, username]);

  const handleSaveNote = async () => {
      setIsSubmitting(true);
      
      const result = await updateLeadNote(username, note);
      
      if (result.success) {
          toast.success("Notes updated successfully");
          if (onOpenChange) onOpenChange(false);
      } else {
          toast.error("Failed to save note");
      }
      setIsSubmitting(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-4 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Notes for {username}</SheetTitle>
          <SheetDescription>
            Edit internal notes for this prospect.
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 flex flex-col gap-4 overflow-hidden py-4">
            {isLoading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <Textarea 
                    placeholder="Add details about this prospect..." 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="flex-1 resize-none text-sm leading-relaxed p-4"
                />
            )}
        </div>

        <SheetFooter className="mt-auto">
            <Button onClick={handleSaveNote} disabled={isSubmitting || isLoading} className="w-full gap-2">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
            </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}