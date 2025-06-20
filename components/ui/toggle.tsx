"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  defaultPressed?: boolean
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  variant?: VariantProps<typeof toggleVariants>["variant"]
  size?: VariantProps<typeof toggleVariants>["size"]
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, variant, size, defaultPressed, pressed, onPressedChange, ...props }, ref) => {
    const [isPressed, setIsPressed] = React.useState(pressed ?? defaultPressed ?? false)

    React.useEffect(() => {
      if (pressed !== undefined) {
        setIsPressed(pressed)
      }
    }, [pressed])

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      const newPressed = !isPressed
      setIsPressed(newPressed)
      onPressedChange?.(newPressed)
      props.onClick?.(event)
    }

    return (
      <button
        type="button"
        role="switch"
        aria-pressed={isPressed}
        data-state={isPressed ? "on" : "off"}
        ref={ref}
        className={cn(toggleVariants({ variant, size, className }))}
        onClick={handleClick}
        {...props}
      />
    )
  }
)

Toggle.displayName = "Toggle"

export { Toggle, toggleVariants }
export type { ToggleProps } 