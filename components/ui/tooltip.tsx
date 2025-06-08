"use client"

import * as React from "react"
import { useFloating, offset, flip, shift, arrow, useHover, useFocus, useDismiss, useRole, useInteractions, FloatingPortal, Placement } from "@floating-ui/react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  delayDuration?: number
  disableHoverableContent?: boolean
}

interface TooltipTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: Placement
  sideOffset?: number
  align?: "start" | "center" | "end"
}

type ContextType = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  getReferenceProps: (props?: React.HTMLProps<Element>) => Record<string, unknown>
  getFloatingProps: (props?: React.HTMLProps<HTMLElement>) => Record<string, unknown>
}

const TooltipContext = React.createContext<ContextType>({
  open: false,
  setOpen: () => {},
  getReferenceProps: () => ({}),
  getFloatingProps: () => ({}),
})

function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ children, open: controlledOpen, defaultOpen = false, onOpenChange, delayDuration = 200, disableHoverableContent = false }, forwardedRef) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
    const open = controlledOpen ?? uncontrolledOpen

    const setOpen: ContextType["setOpen"] = React.useCallback(
      (value) => {
        const newOpen = typeof value === "function" ? value(uncontrolledOpen) : value
        onOpenChange?.(newOpen)
        setUncontrolledOpen(newOpen)
      },
      [onOpenChange]
    )

    const contextValue = React.useMemo<ContextType>(
      () => ({
        open,
        setOpen,
        getReferenceProps: () => ({}),
        getFloatingProps: () => ({}),
      }),
      [open, setOpen]
    )

    return (
      <TooltipContext.Provider value={contextValue}>
        {children}
      </TooltipContext.Provider>
    )
  }
)
Tooltip.displayName = "Tooltip"

const TooltipTrigger = React.forwardRef<HTMLButtonElement, TooltipTriggerProps>(
  ({ className, asChild = false, children, ...props }, ref) => {
    const { setOpen } = React.useContext(TooltipContext)

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        ...props,
        ref,
        onMouseEnter: () => setOpen(true),
        onMouseLeave: () => setOpen(false),
        onFocus: () => setOpen(true),
        onBlur: () => setOpen(false),
      })
    }

    return (
      <button
        type="button"
        ref={ref}
        className={className}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, children, side = "top", sideOffset = 4, align = "center", ...props }, ref) => {
    const { open } = React.useContext(TooltipContext)
    const arrowRef = React.useRef<HTMLDivElement>(null)

    const {
      x,
      y,
      refs,
      strategy,
      context,
      middlewareData: { arrow: { x: arrowX, y: arrowY } = {} },
    } = useFloating({
      placement: side,
      middleware: [
        offset(sideOffset),
        flip(),
        shift(),
        arrow({ element: arrowRef }),
      ],
    })

    const hover = useHover(context, { move: false })
    const focus = useFocus(context)
    const dismiss = useDismiss(context)
    const role = useRole(context, { role: "tooltip" })

    const { getReferenceProps, getFloatingProps } = useInteractions([
      hover,
      focus,
      dismiss,
      role,
    ])

    if (!open) return null

    return (
      <FloatingPortal>
        <div
          ref={refs.setFloating}
          className={cn(
            "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className
          )}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            width: "max-content",
          }}
          {...getFloatingProps()}
          {...props}
        >
          {children}
          <div
            ref={arrowRef}
            className="absolute rotate-45 bg-popover border w-2 h-2"
            style={{
              left: arrowX != null ? `${arrowX}px` : "",
              top: arrowY != null ? `${arrowY}px` : "",
              right: "",
              bottom: "",
              [side]: "-4px",
            }}
          />
        </div>
      </FloatingPortal>
    )
  }
)
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
export type { TooltipProps, TooltipTriggerProps, TooltipContentProps } 