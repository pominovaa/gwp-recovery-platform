import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white px-5 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-semibold">Get Whole Project</div>
          <div className="text-sm text-stone-500">Heal. Live. Give.</div>
        </div>
        <div className="flex flex-wrap gap-5 text-sm text-stone-500">
          <Link href="/#give" className="hover:text-stone-950">Safety Standard</Link>
          <a href="#" className="hover:text-stone-950">Privacy</a>
          <a href="#" className="hover:text-stone-950">Terms</a>
          <a href="#" className="hover:text-stone-950">Contact</a>
        </div>
      </div>
    </footer>
  );
}
