import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexa",
  description: "Placeholder — product positioning not yet defined.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
