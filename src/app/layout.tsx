import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xray Config Manager",
  description: "Lightweight Xray configuration repository manager",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="text-slate-200 antialiased min-h-screen">{children}</body>
    </html>
  );
}
