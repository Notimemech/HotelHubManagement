import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex-1 flex flex-col bg-linen-50 bg-linen-grain">
      {/* HERO ----------------------------------------------------------- */}
      <section className="relative isolate overflow-hidden border-b rule-brass border-linen-200">
        <div className="mx-auto max-w-6xl px-6 py-28 sm:py-36 lg:py-44 grid lg:grid-cols-12 gap-14 items-center">
          <div className="lg:col-span-7 lg:pr-10">
            <p className="font-editorial italic text-brass-700 text-lg tracking-wide mb-4">
              Established 1923 — A Heritage Hotel, Reimagined
            </p>
            <h1 className="font-editorial text-5xl sm:text-6xl lg:text-7xl leading-[1.05] text-ink-900 mb-6">
              A Quiet Respite <br className="hidden sm:block" />
              <span className="italic text-brass-700">between</span> Rooftops <br className="hidden sm:block" />
              &amp; Riverlight.
            </h1>
            <p className="max-w-xl text-base sm:text-lg text-ink-700 leading-relaxed mb-10">
              HotelHub is a small collection of vintage residences in Vietnam,
              restored with the patience of a librarian. Discreet service,
              brass keys, slow breakfasts — the comfort of being known.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-md bg-ink-900 hover:bg-ink-700 text-linen-50 font-semibold px-7 py-3.5 text-sm tracking-wide transition shadow-sm"
              >
                Begin Your Stay
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-md border border-ink-900/40 hover:border-brass-700 hover:text-brass-700 text-ink-900 font-semibold px-7 py-3.5 text-sm tracking-wide transition"
              >
                Returning Guest
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <aside className="border border-linen-300 bg-linen-100 p-6 sm:p-8 shadow-sm">
              <p className="font-editorial italic text-brass-700 text-sm tracking-wider uppercase mb-2">
                Suite of the Month
              </p>
              <h3 className="font-editorial text-3xl text-ink-900 mb-2">The Verandah Suite</h3>
              <p className="text-ink-700 text-sm leading-relaxed mb-5">
                A two-bedroom residence with a private terrace overlooking the
                colonial boulevard. Linen sheets, polished hardwood, a record
                player stocked with evenings.
              </p>
              <ul className="text-xs uppercase tracking-[0.2em] text-ink-500 space-y-2">
                <li>From VND 6.800.000 / night</li>
                <li>Up to 4 guests · 120 m²</li>
                <li>Includes breakfast &amp; butler service</li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* TEXT SECTION --------------------------------------------------- */}
      <section className="border-b rule-brass border-linen-200">
        <div className="mx-auto max-w-3xl px-6 py-24 sm:py-32 text-center">
          <p className="font-editorial italic text-brass-700 text-base tracking-wide mb-4">
            — The promise —
          </p>
          <p className="font-editorial text-2xl sm:text-3xl leading-snug text-ink-900">
            We do not believe in lobbies designed to impress. <br className="hidden sm:block" />
            We believe in the comfort of being{' '}
            <span className="italic text-brass-700">known</span> — your window
            seat, your preferred pillow, your coffee taken with a splash of
            warm milk, never forgotten.
          </p>
          <div className="mt-10 inline-flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-ink-500">
            <span className="h-px w-10 bg-brass-300" />
            A House Philosophy
            <span className="h-px w-10 bg-brass-300" />
          </div>
        </div>
      </section>

      {/* WIDE EDITORIAL FEATURES --------------------------------------- */}
      <section className="border-b rule-brass border-linen-200">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32 grid lg:grid-cols-3 gap-12">
          {[
            {
              k: 'I.',
              t: 'A Reading Room in Lieu of a Bar',
              d: 'Step off Nguyen Hue into a quiet parlor of leather armchairs, hemmed marble tables, and novels waiting to be taken in.',
            },
            {
              k: 'II.',
              t: 'Beds Hand-Stitched in Dalat',
              d: 'Every quilt is sewn by a cooperative of women weavers. The sheets are brushed long-staple cotton; the mattresses are slow.',
            },
            {
              k: 'III.',
              t: 'A Kitchen That Knows Your Name',
              d: 'We open at first light for pho served in porcelain bowls, and end with late-night phin coffee for travelers who never sleep.',
            },
          ].map((card) => (
            <article
              key={card.k}
              className="border-t border-linen-300 pt-8"
            >
              <p className="font-editorial italic text-brass-700 text-lg mb-3">
                {card.k}
              </p>
              <h3 className="font-editorial text-2xl text-ink-900 leading-snug mb-4">
                {card.t}
              </h3>
              <p className="text-ink-700 leading-relaxed text-sm">{card.d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CLOSING CTA --------------------------------------------------- */}
      <section>
        <div className="mx-auto max-w-3xl px-6 py-28 sm:py-36 text-center">
          <p className="font-editorial italic text-brass-700 text-base tracking-wide mb-3">
            — Reserve —
          </p>
          <h2 className="font-editorial text-4xl sm:text-5xl text-ink-900 mb-6">
            Make yourself <span className="italic text-brass-700">at home</span>, tonight.
          </h2>
          <p className="text-ink-700 leading-relaxed mb-10">
            Sign in to manage your reservations, or create an account to receive
            a complimentary upgrade on your first stay.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md bg-ink-900 hover:bg-ink-700 text-linen-50 font-semibold px-8 py-4 text-sm tracking-wide transition shadow-sm"
            >
              Create Account
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md border border-ink-900/40 hover:border-brass-700 hover:text-brass-700 text-ink-900 font-semibold px-8 py-4 text-sm tracking-wide transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
