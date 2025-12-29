"use client"

import * as React from "react"
import { createContext, useContext, useState } from "react"

export type TimeFormat = "Ago" | "12h" | "24h" | "Full"

interface TimeContextType {
  format: TimeFormat
  setFormat: (format: TimeFormat) => void
}

const TimeContext = createContext<TimeContextType | undefined>(undefined)

export function TimeProvider({ 
    children, 
    initialFormat = "Ago" 
}: { 
    children: React.ReactNode, 
    initialFormat?: TimeFormat 
}) {
  const [format, setFormatState] = useState<TimeFormat>(initialFormat)

  const setFormat = async (newFormat: TimeFormat) => {
    setFormatState(newFormat)
    // Persist to cookie via API
    try {
        await fetch('/api/time-prefs', {
            method: 'POST',
            body: JSON.stringify({ format: newFormat })
        });
    } catch (_e) {
        console.error("Failed to persist time preference");
    }
  }

  return (
    <TimeContext.Provider value={{ format, setFormat }}>
      {children}
    </TimeContext.Provider>
  )
}

export function useTimeContext() {
  const context = useContext(TimeContext)
  if (context === undefined) {
    throw new Error("useTimeContext must be used within a TimeProvider")
  }
  return context
}