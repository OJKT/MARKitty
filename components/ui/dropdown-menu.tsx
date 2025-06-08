"use client"

import * as React from "react"
import { useFloating, offset, flip, shift, useListNavigation, useHover, useDismiss, useRole, useInteractions, useClick, FloatingFocusManager, FloatingPortal, FloatingList, useTypeahead } from "@floating-ui/react"
import { Check, ChevronRight, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
  dir?: "ltr" | "rtl"
}

const DropdownMenuContext = React.createContext<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  activeIndex: number | null
  setActiveIndex: React.Dispatch<React.SetStateAction<number | null>>
  getItemProps: (userProps?: React.HTMLProps<HTMLElement>) => Record<string, unknown>
  nested?: boolean
}>({
  open: false,
  setOpen: () => {},
  activeIndex: null,
  setActiveIndex: () => {},
  getItemProps: () => ({}),
})

const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({ children, open: controlledOpen, onOpenChange, modal = true, ...props }, ref) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
    const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)

    const open = controlledOpen ?? uncontrolledOpen
    const setOpen = React.useCallback(
      (open: boolean) => {
        onOpenChange?.(open)
        setUncontrolledOpen(open)
      },
      [onOpenChange]
    )

    const listItemsRef = React.useRef<Array<HTMLElement | null>>([])
    const listContentRef = React.useRef(
      React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return child.props.label || child.props.children
        }
        return null
      }) ?? []
    )

    const {
      x,
      y,
      strategy,
      refs,
      context,
    } = useFloating({
      open,
      onOpenChange: setOpen,
      middleware: [
        offset(5),
        flip(),
        shift(),
      ],
    })

    const hover = useHover(context, { move: false })
    const click = useClick(context)
    const dismiss = useDismiss(context)
    const role = useRole(context)

    const listNavigation = useListNavigation(context, {
      listRef: listItemsRef,
      activeIndex,
      selectedIndex,
      onNavigate: setActiveIndex,
    })

    const typeahead = useTypeahead(context, {
      listRef: listContentRef,
      activeIndex,
      selectedIndex,
      onMatch: setActiveIndex,
    })

    const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
      hover,
      click,
      dismiss,
      role,
      listNavigation,
      typeahead,
    ])

    const contextValue = React.useMemo(
      () => ({
        open,
        setOpen,
        activeIndex,
        setActiveIndex,
        getItemProps,
      }),
      [open, setOpen, activeIndex, setActiveIndex, getItemProps]
    )

    return (
      <DropdownMenuContext.Provider value={contextValue}>
        <div ref={ref} {...props}>
          <div ref={refs.setReference} {...getReferenceProps()}>
            {children}
          </div>
          {open && (
            <FloatingPortal>
              <FloatingFocusManager context={context} modal={modal}>
                <div
                  ref={refs.setFloating}
                  className={cn(
                    "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1",
                    "text-popover-foreground shadow-md",
                    "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                    "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
                    "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                  )}
                  style={{
                    position: strategy,
                    top: y ?? 0,
                    left: x ?? 0,
                  }}
                  {...getFloatingProps()}
                >
                  <FloatingList elementsRef={listItemsRef} labelsRef={listContentRef}>
                    {children}
                  </FloatingList>
                </div>
              </FloatingFocusManager>
            </FloatingPortal>
          )}
        </div>
      </DropdownMenuContext.Provider>
    )
  }
)
DropdownMenu.displayName = "DropdownMenu"

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ className, asChild = false, children, ...props }, ref) => {
    const { open } = React.useContext(DropdownMenuContext)

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...props,
        "data-state": open ? "open" : "closed",
        ref,
      })
    }

    return (
      <button
        ref={ref}
        type="button"
        className={className}
        data-state={open ? "open" : "closed"}
        {...props}
      >
        {children}
      </button>
    )
  }
)
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  inset?: boolean
  disabled?: boolean
}

const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ className, inset, disabled, children, ...props }, ref) => {
    const { getItemProps } = React.useContext(DropdownMenuContext)
    const itemProps = getItemProps()

    return (
      <button
        ref={ref}
        type="button"
        role="menuitem"
        disabled={disabled}
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5",
          "text-sm outline-none transition-colors focus:bg-accent",
          "focus:text-accent-foreground data-[disabled]:pointer-events-none",
          "data-[disabled]:opacity-50",
          inset && "pl-8",
          className
        )}
        {...itemProps}
        {...props}
      >
        {children}
      </button>
    )
  }
)
DropdownMenuItem.displayName = "DropdownMenuItem"

interface DropdownMenuCheckboxItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const DropdownMenuCheckboxItem = React.forwardRef<HTMLButtonElement, DropdownMenuCheckboxItemProps>(
  ({ className, children, checked, onCheckedChange, ...props }, ref) => {
    const { getItemProps } = React.useContext(DropdownMenuContext)
    const itemProps = getItemProps()

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onCheckedChange?.(!checked)
      props.onClick?.(event)
    }

    return (
      <button
        ref={ref}
        type="button"
        role="menuitemcheckbox"
        aria-checked={checked}
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2",
          "text-sm outline-none transition-colors focus:bg-accent",
          "focus:text-accent-foreground data-[disabled]:pointer-events-none",
          "data-[disabled]:opacity-50",
          className
        )}
        {...itemProps}
        {...props}
        onClick={handleClick}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {checked && <Check className="h-4 w-4" />}
        </span>
        {children}
      </button>
    )
  }
)
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem"

interface DropdownMenuRadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
}

const DropdownMenuRadioGroup = React.forwardRef<HTMLDivElement, DropdownMenuRadioGroupProps>(
  ({ value, onValueChange, children, ...props }, ref) => {
    const [selectedValue, setSelectedValue] = React.useState(value)

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value)
      }
    }, [value])

    const handleValueChange = (newValue: string) => {
      setSelectedValue(newValue)
      onValueChange?.(newValue)
    }

    return (
      <div ref={ref} role="radiogroup" {...props}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              checked: child.props.value === selectedValue,
              onCheckedChange: () => handleValueChange(child.props.value),
            })
          }
          return child
        })}
      </div>
    )
  }
)
DropdownMenuRadioGroup.displayName = "DropdownMenuRadioGroup"

interface DropdownMenuRadioItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  value: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const DropdownMenuRadioItem = React.forwardRef<HTMLButtonElement, DropdownMenuRadioItemProps>(
  ({ className, children, checked, onCheckedChange, ...props }, ref) => {
    const { getItemProps } = React.useContext(DropdownMenuContext)
    const itemProps = getItemProps()

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onCheckedChange?.(true)
      props.onClick?.(event)
    }

    return (
      <button
        ref={ref}
        type="button"
        role="menuitemradio"
        aria-checked={checked}
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2",
          "text-sm outline-none transition-colors focus:bg-accent",
          "focus:text-accent-foreground data-[disabled]:pointer-events-none",
          "data-[disabled]:opacity-50",
          className
        )}
        {...itemProps}
        {...props}
        onClick={handleClick}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {checked && <Circle className="h-2 w-2 fill-current" />}
        </span>
        {children}
      </button>
    )
  }
)
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem"

interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean
}

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ className, inset, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "px-2 py-1.5 text-sm font-semibold",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  )
)
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
}
export type {
  DropdownMenuProps,
  DropdownMenuTriggerProps,
  DropdownMenuItemProps,
  DropdownMenuCheckboxItemProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuRadioItemProps,
  DropdownMenuLabelProps,
} 