import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:ring-primary/50",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90 focus-visible:ring-destructive/50",
        outline:
          "border-2 border-slate-300 bg-background text-slate-900 shadow-sm hover:bg-slate-50 hover:border-slate-400 focus-visible:ring-slate-400/50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800 dark:hover:border-slate-500 dark:focus-visible:ring-slate-500/50",
        "outline-light":
          "border-2 border-white/30 bg-transparent text-white shadow-sm hover:bg-white/10 hover:border-white/50 focus-visible:ring-white/50 backdrop-blur-sm",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 focus-visible:ring-secondary/50",
        ghost:
          "text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400/50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100",
        "ghost-light":
          "text-white/90 hover:bg-white/10 hover:text-white focus-visible:ring-white/50 backdrop-blur-sm",
        link: "text-primary underline-offset-4 hover:underline focus-visible:ring-primary/50",
        navigation:
          "border-2 border-white/20 bg-white/5 text-white font-semibold shadow-sm hover:bg-white/10 hover:border-white/40 focus-visible:ring-white/50 backdrop-blur-sm active:bg-white/15",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm min-h-[44px] has-[>svg]:px-3",
        sm: "h-9 px-3 py-1.5 text-sm min-h-[36px] has-[>svg]:px-2.5",
        lg: "h-12 px-6 py-3 text-base min-h-[48px] has-[>svg]:px-5",
        xl: "h-14 px-8 py-4 text-lg min-h-[56px] has-[>svg]:px-7",
        icon: "size-10 min-h-[44px] min-w-[44px]",
        "icon-sm": "size-9 min-h-[36px] min-w-[36px]",
        "icon-lg": "size-12 min-h-[48px] min-w-[48px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
