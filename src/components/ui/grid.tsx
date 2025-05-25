import * as React from "react"
import { cn } from "@/lib/utils"

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: "none" | "sm" | "md" | "lg" | "xl"
  responsive?: boolean
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ 
    className, 
    cols = { default: 1, sm: 1, md: 2, lg: 3 }, 
    gap = "md", 
    responsive = true,
    ...props 
  }, ref) => {
    const getGridCols = () => {
      const classes = [];
      
      if (cols.default) classes.push(`grid-cols-${cols.default}`);
      if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
      if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
      if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
      if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
      
      return classes.join(" ");
    };

    const getGapClass = () => {
      switch (gap) {
        case "none": return "gap-0";
        case "sm": return "gap-2 sm:gap-3";
        case "md": return "gap-3 sm:gap-4 lg:gap-6";
        case "lg": return "gap-4 sm:gap-6 lg:gap-8";
        case "xl": return "gap-6 sm:gap-8 lg:gap-10";
        default: return "gap-3 sm:gap-4 lg:gap-6";
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "grid",
          getGridCols(),
          getGapClass(),
          responsive && "w-full",
          className
        )}
        {...props}
      />
    )
  }
)
Grid.displayName = "Grid"

interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
}

const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ className, span, ...props }, ref) => {
    const getSpanClass = () => {
      if (!span) return "";
      
      const classes = [];
      
      if (span.default) classes.push(`col-span-${span.default}`);
      if (span.sm) classes.push(`sm:col-span-${span.sm}`);
      if (span.md) classes.push(`md:col-span-${span.md}`);
      if (span.lg) classes.push(`lg:col-span-${span.lg}`);
      if (span.xl) classes.push(`xl:col-span-${span.xl}`);
      
      return classes.join(" ");
    };

    return (
      <div
        ref={ref}
        className={cn(getSpanClass(), className)}
        {...props}
      />
    )
  }
)
GridItem.displayName = "GridItem"

export { Grid, GridItem }
