import type { AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type FilterChipProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  active?: boolean;
};

export default function FilterChip({ active = false, className, children, ...props }: FilterChipProps) {
  return (
    <a
      className={cn("ds-chip", active && "ds-chip-active", className)}
      aria-current={active ? "true" : undefined}
      {...props}
    >
      {children}
    </a>
  );
}
