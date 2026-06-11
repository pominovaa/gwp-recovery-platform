import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Get Whole Project",
  description: "Eating disorder recovery support platform for private tools, moderated stories, family coordination, and urgent resources."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div id="top" className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f8f3ed,transparent_34%),linear-gradient(180deg,#fffaf4_0%,#ffffff_42%,#f7f7f5_100%)] text-stone-950">
          <SiteNav />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
