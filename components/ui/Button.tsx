import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export default function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const base = "rounded-full px-5 py-2 font-semibold transition";
  const style =
    variant === "primary"
      ? "bg-brand-700 text-white hover:bg-brand-900"
      : "border border-brand-700 text-brand-700 hover:bg-brand-50";

  return <button className={`${base} ${style} ${className}`.trim()} {...props} />;
}
