import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";

export default function Page() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf4_0%,#ffffff_48%,#f7f7f5_100%)] text-stone-950">
      <SiteNav />
      <main className="px-5 py-20">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-stone-200 bg-white p-8 text-center shadow-sm">
          <div className="text-sm font-semibold uppercase tracking-[0.25em] text-stone-500">Donation</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Your donation is being activated.</h1>
          <p className="mt-5 text-lg leading-8 text-stone-600">
            Stripe has accepted the checkout. Your donation status will update after the billing webhook finishes syncing.
          </p>
          <a href="/find-support" className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-stone-950 px-5 text-sm font-semibold text-white transition hover:bg-stone-800">
            Back to donations
          </a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
