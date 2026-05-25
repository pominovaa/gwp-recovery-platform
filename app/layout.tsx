import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Get Whole Project",
  description: "Eating disorder recovery support platform for private tools, moderated stories, family coordination, and urgent resources."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
