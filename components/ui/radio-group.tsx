"use client"

import * as React from "react"
import { Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface RadioGroupProps extends React.ComponentPropsWithoutRef<"div"> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  name?: string
  required?: boolean
  orientation?: "horizontal" | "vertical"
  loop?: boolean
  disabled?: boolean
}

const RadioGroupContext = React.createContext<{
  name?: string
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
}>({})

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, defaultValue, onValueChange, name, disabled, orientation = "vertical", children, ...props }, ref) => {
    const [selectedValue, setSelectedValue] = React.useState(value ?? defaultValue ?? "")

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value)
      }
    }, [value])

    const handleChange = (newValue: string) => {
      setSelectedValue(newValue)
      onValueChange?.(newValue)
    }

    return (
      <RadioGroupContext.Provider value={{ name, value: selectedValue, onChange: handleChange, disabled }}>
        <div
          ref={ref}
          role="radiogroup"
          className={cn(
            "flex",
            orientation === "horizontal" ? "flex-row gap-x-4" : "flex-col gap-y-2",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

interface RadioGroupItemProps extends Omit<React.ComponentPropsWithoutRef<"input">, "type" | "onChange"> {
  value: string
  disabled?: boolean
  required?: boolean
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, disabled, children, ...props }, ref) => {
    const { name, value: groupValue, onChange, disabled: groupDisabled } = React.useContext(RadioGroupContext)
    const isDisabled = disabled || groupDisabled

    return (
      <label className="flex items-center gap-x-2">
        <input
          type="radio"
          ref={ref}
          name={name}
          value={value}
          checked={value === groupValue}
          disabled={isDisabled}
          onChange={(e) => e.target.checked && onChange?.(value)}
          className="sr-only"
          {...props}
        />
        <div
          className={cn(
            "aspect-square h-4 w-4 rounded-full border border-primary text-primary",
            "ring-offset-background focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            value === groupValue && "bg-primary",
            className
          )}
        >
          {value === groupValue && (
            <div className="flex items-center justify-center">
              <Circle className="h-2.5 w-2.5 fill-background text-background" />
            </div>
          )}
        </div>
        {children}
      </label>
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
export type { RadioGroupProps, RadioGroupItemProps }
