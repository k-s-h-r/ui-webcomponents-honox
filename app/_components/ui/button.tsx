import type { JSX, PropsWithChildren } from "hono/jsx"
import { cn } from "../../lib/utils"

type Props = {} & JSX.IntrinsicElements["button"]

export default function Component({
  children,
  class: className,
  ...props
}: PropsWithChildren<Props>) {
  return (
    <button
      {...props}
      class={cn(
        "inline-flex items-center justify-center gap-2 rounded text-sm leading-tight transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        "px-4 py-1",
        "bg-gray-100 hover:bg-gray-100/90 border",
        className
      )}
    >
      {children}
    </button>
  )
}
