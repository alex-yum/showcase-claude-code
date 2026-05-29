import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-14 w-full rounded-xl border-2 border-gray-200 bg-white px-5 py-3 text-base transition-all duration-300",
          "placeholder:text-gray-400",
          "focus-visible:outline-none focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/10 focus-visible:-translate-y-0.5",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
