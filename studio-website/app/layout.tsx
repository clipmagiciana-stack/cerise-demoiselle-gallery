import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cerise Demoiselle Studio",
  description: "Decorative objects and candles, made to order.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
