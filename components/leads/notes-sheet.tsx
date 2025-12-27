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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Loader2 } from "lucide-react"
import { addLeadNote, getLeadNotes } from "@/app/(dashboard)/leads/actions"

interface Note {
    id: number;
    text: string;
    operator: string;
    created_at: string;
}

interface NotesSheetProps {
  username: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function NotesSheet({ username, open, onOpenChange }: NotesSheetProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch notes when sheet opens
  useEffect(() => {
      let isMounted = true;
      if (open) {
          // Use a slight delay or requestAnimationFrame to move it out of the synchronous render path
          const fetchNotes = async () => {
              setIsLoading(true);
              try {
                  const data = await getLeadNotes(username);
                  if (isMounted) setNotes(data as Note[]);
              } finally {
                  if (isMounted) setIsLoading(false);
              }
          };
          fetchNotes();
      }
      return () => { isMounted = false; };
  }, [open, username]);

  const handleAddNote = async () => {
      if (!newNote.trim()) return;

      setIsSubmitting(true);
      const tempId = Date.now();
      
      // Optimistic update
      const optimisticNote: Note = {
          id: tempId,
          text: newNote,
          operator: "Me", 
          created_at: new Date().toISOString()
      };
      setNotes([optimisticNote, ...notes]);
      setNewNote("");

      const result = await addLeadNote(username, optimisticNote.text);
      
      if (!result.success) {
          // Revert if failed
          setNotes(prev => prev.filter(n => n.id !== tempId));
          alert("Failed to save note");
      }
      setIsSubmitting(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-4">
        <SheetHeader>
          <SheetTitle>Notes for @{username}</SheetTitle>
          <SheetDescription>
            View and add internal notes for this prospect.
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <ScrollArea className="flex-1 pr-4">
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {notes.map(note => (
                            <div key={note.id} className="bg-muted p-3 rounded-lg text-sm">
                                <p>{note.text}</p>
                                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                                    <span>{note.operator}</span>
                                    <span>{new Date(note.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                        {notes.length === 0 && !isLoading && (
                            <p className="text-center text-muted-foreground text-sm py-4">No notes yet.</p>
                        )}
                    </div>
                )}
            </ScrollArea>
        </div>

        <SheetFooter className="mt-auto flex flex-col sm:flex-col gap-2">
            <Textarea 
                placeholder="Type your note here..." 
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="resize-none"
            />
            <Button onClick={handleAddNote} disabled={isSubmitting || !newNote.trim()} className="w-full gap-2">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Add Note
            </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
