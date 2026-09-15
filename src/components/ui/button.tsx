import LiquidMetalButton from "@/components/ui/liquid-metal-button";

/**
 * Site buttons — thin wrapper around the liquid-metal component so callers
 * only ever deal with variant/size/href. Primary is light (pearl),
 * secondary is dark (obsidian). Label weight stays at 500.
 */

type Variant = "primary" | "secondary";
type Size = "lg" | "sm";

const SIZES: Record<
  Size,
  { disc: number; glyph: number; padding: string; gap: number; font: number; minHeight: number; edgeWidth: number; shadow: string }
> = {
  lg: {
    disc: 40,
    glyph: 16,
    padding: "6px 24px 6px 6px",
    gap: 12,
    font: 16,
    minHeight: 52,
    edgeWidth: 3,
    shadow: "0px 12px 24px -12px rgba(0,0,0,0.45)",
  },
  sm: {
    disc: 28,
    glyph: 12,
    padding: "4px 16px 4px 4px",
    gap: 9,
    font: 14,
    minHeight: 36,
    edgeWidth: 2.2,
    shadow: "0px 8px 16px -10px rgba(0,0,0,0.4)",
  },
};

export function Button({
  variant = "primary",
  size = "lg",
  href,
  children,
  glyph,
}: {
  variant?: Variant;
  size?: Size;
  href: string;
  children: string;
  glyph?: "sparkle" | "play" | "arrow-up-right" | "plus" | "search" | "home";
}) {
  const s = SIZES[size];
  return (
    <LiquidMetalButton
      label={children}
      link={href}
      theme={variant === "primary" ? "pearl" : "obsidian"}
      icon={{
        glyph: glyph ?? (variant === "primary" ? "sparkle" : "play"),
        size: s.disc,
        glyphSize: s.glyph,
        color: "#F8FAFC",
        fill: variant === "primary" ? "#12151C" : "#353B43",
      }}
      font={{ fontSize: s.font, fontWeight: 500, letterSpacing: "-0.02em" }}
      padding={s.padding}
      gap={s.gap}
      minHeight={s.minHeight}
      edge={{ width: s.edgeWidth }}
      shadow={s.shadow}
      ring={false}
    />
  );
}
