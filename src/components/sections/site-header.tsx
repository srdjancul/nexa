import Link from "next/link";
import { Button } from "@/components/ui/button";

const NAV = [
  { label: "Product", href: "#product" },
  { label: "Docs", href: "#docs" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "#blog" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-ground/70 backdrop-blur-xl">
      {/* Three equal-width tracks: logo | links | actions. The outer tracks
          balance each other, so the links sit on the true page centre. */}
      <div className="mx-auto grid h-[68px] max-w-page grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-5">
        <div className="flex justify-start">
          {/* Wordmark placeholder — swap for the real mark when it exists. */}
          <Link
            href="/"
            className="font-display text-[1.0625rem] font-medium tracking-[-0.01em]"
          >
            Nexa
          </Link>
        </div>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {NAV.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="nav-hum text-ink-muted hover:text-ink text-sm font-medium"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="#signin"
            className="nav-hum text-ink-muted hover:text-ink hidden px-2 py-2 text-sm font-medium sm:block"
          >
            Sign in
          </Link>
          <Button href="#start" size="sm">
            Start free
          </Button>
        </div>
      </div>
    </header>
  );
}
