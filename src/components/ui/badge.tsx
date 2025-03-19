import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "destructive"
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        {
          "bg-primary-100 text-primary-700": variant === "default",
          "bg-gray-100 text-gray-900": variant === "secondary",
          "bg-success-100 text-success-700": variant === "success",
          "bg-destructive-100 text-destructive-700": variant === "destructive",
          "border border-gray-200 text-gray-700": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
} 