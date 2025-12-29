"use client"

import * as React from "react"
import { Loader2, AlertTriangle, User, Pencil, ArrowRight, Mail, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { setOperatorName, signOutAction } from "./actions"
import { toast } from "sonner"

interface OnboardingFormProps {
    unavailableNames: string[];
    googleName: string;
    googleEmail: string;
    currentOperatorName?: string;
}

export function OnboardingForm({ unavailableNames, googleName, googleEmail, currentOperatorName }: OnboardingFormProps) {
  const [nameValue, setNameValue] = React.useState(currentOperatorName || googleName || "")
  const [emailValue, setEmailValue] = React.useState(googleEmail)
  const [isEditing, setIsEditing] = React.useState(!currentOperatorName && !googleName)
  const [isPending, setIsPending] = React.useState(false)

  // DEV MODE CHECK
  const isDev = process.env.NODE_ENV === 'development';

  const isNameUnavailable = unavailableNames.some(name => name.toLowerCase() === nameValue.toLowerCase());
  
  // Validation Logic
  // 1. Name must be present
  // 2. If in DEV mode, email must be present
  // 3. If NOT in DEV mode, name must not be taken by someone else
  const isInvalid = !nameValue || 
                   (isDev && !emailValue) || 
                   (!isDev && isNameUnavailable && nameValue !== currentOperatorName);

  const handleSubmit = async () => {
    if (isInvalid) return;
    
    setIsPending(true)
    // Pass override email if in dev mode
    const res = await setOperatorName(nameValue, isDev ? emailValue : undefined)
    
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
      {isDev && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-3 mb-2">
              <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-tight">
                  Dev Mode Active: Identity Spoofing Enabled
              </p>
          </div>
      )}

      {isEditing ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
              {/* Email Override (DEV ONLY) */}
              {isDev && (
                  <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">
                          Override Email (Dev Only)
                      </label>
                      <div className="relative">
                          <Input 
                              value={emailValue}
                              onChange={(e) => setEmailValue(e.target.value)}
                              className="h-12 bg-background/50 pl-10 border-primary/10 focus-visible:ring-primary/30"
                              placeholder="dev@example.com"
                          />
                          <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground/50" />
                      </div>
                  </div>
              )}

              <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">
                      Choose Display Name
                  </label>
                  <div className="relative">
                      <Input 
                          value={nameValue}
                          onChange={(e) => setNameValue(e.target.value)}
                          className="h-14 text-lg bg-background/50 pl-11 border-primary/20 focus-visible:ring-primary/30"
                          placeholder="e.g. Agent Smith"
                          autoFocus
                      />
                      <User className="absolute left-4 top-4 h-6 w-6 text-muted-foreground/50" />
                  </div>
                  {!isDev && isNameUnavailable && nameValue !== currentOperatorName && (
                      <div className="flex items-center gap-2 text-xs text-red-500 font-medium animate-in slide-in-from-left-2 ml-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>This name is already taken.</span>
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
                      <p className="text-xl font-bold text-foreground">{nameValue}</p>
                      {isDev && <p className="text-[10px] text-muted-foreground font-mono">{emailValue}</p>}
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
            className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors font-medium"
          >
            Not you? Switch Google Account
          </button>
      </div>
    </div>
  )
}