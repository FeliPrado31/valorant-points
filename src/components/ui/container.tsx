import * as React from "react"
import { cn } from "@/lib/utils"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full"
  padding?: "none" | "sm" | "md" | "lg"
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "lg", padding = "md", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mx-auto w-full",
          // Container sizes (mobile-first)
          {
            "max-w-sm": size === "sm",
            "max-w-2xl": size === "md", 
            "max-w-6xl": size === "lg",
            "max-w-7xl": size === "xl",
            "max-w-none": size === "full",
          },
          // Padding options (mobile-first)
          {
            "px-0": padding === "none",
            "px-4 sm:px-6": padding === "sm",
            "px-4 sm:px-6 lg:px-8": padding === "md",
            "px-6 sm:px-8 lg:px-12": padding === "lg",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Container.displayName = "Container"

export { Container }
