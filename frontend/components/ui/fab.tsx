import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface FABProps extends React.ComponentProps<typeof Button> {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
}

export function FAB({ 
  className, 
  position = "bottom-right",
  children,
  ...props 
}: FABProps) {
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-20 right-6",
    "top-left": "top-20 left-6",
  }

  return (
    <Button
      className={cn(
        "fixed z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 animate-fade-in",
        positionClasses[position],
        className
      )}
      size="icon"
      {...props}
    >
      {children}
    </Button>
  )
}