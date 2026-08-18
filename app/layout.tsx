import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Daily Routine | YV English",
  description: "Interactive reading, vocabulary, listening and comprehension practice by YV English.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/yv-english-icon.svg",
    shortcut: "/yv-english-icon.svg",
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
