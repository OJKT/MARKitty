"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal" | "both"
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, orientation = "both", children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative overflow-auto",
        orientation === "vertical" && "overflow-x-hidden",
        orientation === "horizontal" && "overflow-y-hidden",
        "[&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar]:h-2.5",
        "[&::-webkit-scrollbar-track]:bg-transparent",
        "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border",
        "[&::-webkit-scrollbar-corner]:bg-transparent",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }
export type { ScrollAreaProps } 