import { FindSupportContent } from "@/components/find-support/find-support-content";
import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";

export function FindSupportPage() {
  return (
    <div id="top" className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f8f3ed,transparent_34%),linear-gradient(180deg,#fffaf4_0%,#ffffff_42%,#f7f7f5_100%)] text-stone-950">
      <SiteNav />
      <main>
        <FindSupportContent />
      </main>
      <SiteFooter />
    </div>
  );
}
