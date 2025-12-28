"use client"

import * as React from "react"
import { Loader2, AlertTriangle, User, Pencil, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { setOperatorName, signOutAction } from "./actions"
import { toast } from "sonner"

interface OnboardingFormProps {
    unavailableNames: string[];
    googleName: string;
    currentOperatorName?: string;
}

export function OnboardingForm({ unavailableNames, googleName, currentOperatorName }: OnboardingFormProps) {
  const [value, setValue] = React.useState(currentOperatorName || googleName || "")
  const [isEditing, setIsEditing] = React.useState(!currentOperatorName && !googleName)
  const [isPending, setIsPending] = React.useState(false)

  const isUnavailable = unavailableNames.some(name => name.toLowerCase() === value.toLowerCase());
  // If we are renaming (value != current), or creating new, availability check matters.
  // Exception: If value == currentOperatorName, it's valid (it's me).
  const isInvalid = !value || (isUnavailable && value !== currentOperatorName);

  const handleSubmit = async () => {
    if (isInvalid) return;
    
    setIsPending(true)
    const res = await setOperatorName(value)
    if (res.success) {
      toast.success("Identity established!")
      window.location.href = "/"
    } else {
      toast.error(res.error || "Failed to update identity")
      setIsPending(false)
    }
  }

  // Auto-switch to edit if no valid default
  React.useEffect(() => {
      if (!currentOperatorName && !googleName) setIsEditing(true);
  }, [currentOperatorName, googleName]);

  return (
    <div className="space-y-6">
      {isEditing ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Choose Display Name
                  </label>
                  <div className="relative">
                      <Input 
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          className="h-14 text-lg bg-background/50 pl-11 border-primary/20 focus-visible:ring-primary/30"
                          placeholder="e.g. Agent Smith"
                          autoFocus
                      />
                      <User className="absolute left-4 top-4 h-6 w-6 text-muted-foreground/50" />
                  </div>
                  {isUnavailable && value !== currentOperatorName && (
                      <div className="flex items-center gap-2 text-xs text-red-500 font-medium animate-in slide-in-from-left-2">
                          <AlertTriangle className="h-3 w-3" />
                          <span>This name is already taken by another operator.</span>
                      </div>
                  )}
              </div>
          </div>
      ) : (
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex items-center justify-between gap-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Continue as</p>
                      <p className="text-xl font-bold text-foreground">{value}</p>
                  </div>
              </div>
              <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsEditing(true)}
                  className="rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary"
              >
                  <Pencil className="h-4 w-4" />
              </Button>
          </div>
      )}

      <Button 
        className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 bg-[oklch(0.55_0.18_285)] hover:bg-[oklch(0.45_0.15_285)] text-white transition-all rounded-xl" 
        disabled={isInvalid || isPending}
        onClick={handleSubmit}
      >
        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : (
            <span className="flex items-center gap-2">
                Confirm & Access Dashboard <ArrowRight className="h-5 w-5 opacity-50" />
            </span>
        )}
      </Button>

      <div className="text-center">
          <button 
            onClick={() => signOutAction()}
            className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors"
          >
            Not you? Switch Google Account
          </button>
      </div>
    </div>
  )
}
