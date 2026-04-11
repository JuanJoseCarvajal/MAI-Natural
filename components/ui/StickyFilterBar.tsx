import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type StickyFilterBarProps = HTMLAttributes<HTMLDivElement>;

export default function StickyFilterBar({ className, children, ...props }: StickyFilterBarProps) {
  return (
    <div className={cn("ds-sticky-top", className)} {...props}>
      {children}
    </div>
  );
}
