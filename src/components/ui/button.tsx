import Link from "next/link";
import type { ComponentProps } from "react";

/**
 * Interim buttons. Both variants get replaced by the liquid-metal component
 * once its source lands — keep the API (variant: primary | secondary) so the
 * swap touches only this file. Primary is light, secondary is dark.
 * Type never exceeds weight 500.
 */

type Variant = "primary" | "secondary";

const base =
  "inline-flex h-11 items-center justify-center gap-2 rounded-pill px-6 text-[0.9375rem] font-medium whitespace-nowrap transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out active:translate-y-px";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-ground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_28px_-10px_rgba(47,123,255,0.7)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_12px_38px_-10px_rgba(47,123,255,0.9)]",
  secondary:
    "bg-elevated border border-line text-ink hover:border-line-strong hover:bg-white/[0.06]",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: { variant?: Variant } & ComponentProps<typeof Link>) {
  return (
    <Link className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}
