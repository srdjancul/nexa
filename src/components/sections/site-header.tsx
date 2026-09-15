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
      <div className="mx-auto flex h-[68px] max-w-page items-center justify-between px-4 sm:px-5">
        {/* Wordmark placeholder — swap for the real mark when it exists. */}
        <Link
          href="/"
          className="font-display text-[1.0625rem] font-extrabold tracking-[-0.02em]"
        >
          Nexa
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {NAV.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-ink-muted hover:text-ink text-sm font-medium transition-colors duration-150"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="#signin"
            className="text-ink-muted hover:text-ink hidden px-3 py-2 text-sm font-medium transition-colors duration-150 sm:block"
          >
            Sign in
          </Link>
          <Button href="#start" className="h-10 px-5 text-sm">
            Start free
          </Button>
        </div>
      </div>
    </header>
  );
}
