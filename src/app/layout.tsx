import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nexa — Know what your agents actually did",
  description:
    "Nexa traces every run, every tool call and every dollar your agents spend.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="min-h-dvh" suppressHydrationWarning>{children}</body>
    </html>
  );
}
