'use client'

import * as React from "react"
import { Moon, Sun } from "lucide-react"
 
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button variant="outline" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? (
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] text-gray-700 scale-0 transition-all rotate-0 scale-100" />
      )}
    </Button>
  )
}
