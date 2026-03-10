import { cn } from "@/lib/utils"

/**
 * Skeleton - Upgraded with premium shimmer effect for cinematic loading.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative rounded-md bg-muted shimmer-wrapper", 
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
