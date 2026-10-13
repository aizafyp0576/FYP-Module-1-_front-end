import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Al-Hamra Textile — Admin",
  description: "Integrated Textile Management & Analytics Platform — System Administration",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
