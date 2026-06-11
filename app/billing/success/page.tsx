import Link from "next/link";

export default function Page() {
  return (
    <section className="px-4 py-20 sm:px-5">
      <div className="mx-auto w-full max-w-3xl min-w-0 overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white p-6 text-center shadow-sm sm:rounded-[2rem] sm:p-8">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500 sm:tracking-[0.25em]">Donation</div>
        <h1 className="mt-4 break-words text-3xl font-semibold tracking-tight sm:text-4xl">Your donation is being activated.</h1>
        <p className="mt-5 break-words text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
          Stripe has accepted the checkout. Your donation status will update after the billing webhook finishes syncing.
        </p>
        <Link href="/find-support" className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-center text-sm font-semibold leading-5 text-white transition hover:bg-stone-800">
          Back to donations
        </Link>
      </div>
    </section>
  );
}
