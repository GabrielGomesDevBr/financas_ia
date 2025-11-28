import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Solid variants with colored shadows
        default:
          "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40",
        success:
          "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40",
        danger:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40",
        warning:
          "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40",
        accent:
          "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40",

        // Soft variants with light backgrounds
        "success-soft":
          "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100",
        "danger-soft":
          "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
        "warning-soft":
          "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100",
        "accent-soft":
          "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100",
        "primary-soft":
          "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100",

        // Outline variants
        outline:
          "border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50",
        "outline-success":
          "border-2 border-green-500 text-green-700 bg-white hover:bg-green-50",
        "outline-danger":
          "border-2 border-red-500 text-red-700 bg-white hover:bg-red-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
