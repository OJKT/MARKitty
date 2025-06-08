"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

interface LabelProps extends React.ComponentPropsWithoutRef<"label">, VariantProps<typeof labelVariants> {
  htmlFor?: string
  asChild?: boolean
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, asChild = false, children, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      const childProps = {
        ...children.props,
        ...props,
        className: cn(labelVariants(), className, children.props.className),
        ref: ref,
      }
      return React.cloneElement(children, childProps)
    }

    return (
      <label
        ref={ref}
        className={cn(labelVariants(), className)}
        {...props}
      >
        {children}
      </label>
    )
  }
)
Label.displayName = "Label"

export { Label, type LabelProps }
