"use client"

import * as React from "react"
import { useFloating, offset, flip, shift, FloatingPortal, FloatingFocusManager } from "@floating-ui/react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const ToastContext = React.createContext<{
  toasts: Array<{
    id: string
    title?: string
    description?: string
    action?: React.ReactNode
    variant?: "default" | "destructive"
  }>
  addToast: (toast: Omit<ToastProps, "id">) => void
  removeToast: (id: string) => void
}>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
})

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Array<ToastProps>>([])

  const addToast = React.useCallback((toast: Omit<ToastProps, "id">) => {
    setToasts((prev) => [...prev, { ...toast, id: Math.random().toString() }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const value = React.useMemo(
    () => ({ toasts, addToast, removeToast }),
    [toasts, addToast, removeToast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  )
}

function ToastViewport() {
  const { toasts } = React.useContext(ToastContext)

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  )
}

interface ToastProps {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

function Toast({ id, title, description, action, variant = "default" }: ToastProps) {
  const { removeToast } = React.useContext(ToastContext)
  const [open, setOpen] = React.useState(true)

  const {
    x,
    y,
    strategy,
    refs,
    context,
  } = useFloating({
    open,
    onOpenChange: (open) => {
      setOpen(open)
      if (!open) {
        setTimeout(() => removeToast(id), 150)
      }
    },
    middleware: [
      offset(5),
      flip(),
      shift(),
    ],
  })

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <FloatingPortal>
      <FloatingFocusManager context={context} modal={false}>
        <div
          ref={refs.setFloating}
          className={cn(
            toastVariants({ variant }),
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=closed]:slide-out-to-right-full data-[state=open]:sm:slide-in-from-bottom-full"
          )}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
          }}
          data-state={open ? "open" : "closed"}
        >
          <div className="grid gap-1">
            {title && <div className="text-sm font-semibold">{title}</div>}
            {description && <div className="text-sm opacity-90">{description}</div>}
          </div>
          {action && (
            <div className="flex shrink-0 items-center gap-2">
              {action}
            </div>
          )}
          <button
            onClick={() => setOpen(false)}
            className={cn(
              "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
              "group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600"
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </FloatingFocusManager>
    </FloatingPortal>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export type { ToastProps } 