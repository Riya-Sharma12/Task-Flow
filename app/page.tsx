export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground grid-paper">
      <header className="brutal-border border-l-0 border-r-0 border-t-0 bg-ink text-paper">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em]">
          <span>Vol. 01 · Edition Daily</span>
          <span className="hidden md:block">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <a href="/auth?tab=signin" className="underline underline-offset-4 transition-colors hover:text-lime">Enter →</a>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl flex-col justify-between px-6 py-16 md:py-24">
        <div className="grid grid-cols-12 items-end gap-6">
          <div className="col-span-12 text-[11px] uppercase tracking-[0.2em] text-muted-foreground md:col-span-2 md:text-xs">
            {/* №<br />001 */}
          </div>
          <h1 className="col-span-12 font-display text-[14vw] leading-[0.85] tracking-[-0.04em] md:col-span-10 md:text-[10rem]">
            The task <br />
            <span className="italic">ledger</span>{' '}
            <span className="inline-block align-middle bg-lime px-4 py-1 text-[8vw] text-ink brutal-border brutal-shadow font-display italic -rotate-1 tracking-wide md:text-5xl">
              for finishers.
            </span>
          </h1>
        </div>

        <div className="mt-16 grid grid-cols-12 gap-6">
          <article className="col-span-12 md:col-span-5 md:col-start-2">
            <p className="font-display text-2xl leading-snug md:text-3xl">
              Indexcard is a defiantly simple place to write down what you said you’d do — and a satisfying place to
              <em> cross it out</em>.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/auth?tab=signup"
                className="rounded-none bg-ink px-6 py-4 font-mono text-xs uppercase tracking-[0.2em] text-paper brutal-border brutal-shadow transition-all hover:-translate-y-0.5 hover:bg-black hover:shadow-none"
              >
                Start the ledger →
              </a>
              <a
                href="/auth?tab=signin"
                className="bg-paper px-6 py-4 font-mono text-xs uppercase tracking-[0.2em] text-ink brutal-border transition-colors hover:bg-lime"
              >
                I have an account
              </a>
            </div>
          </article>

          <aside className="col-span-12 bg-card p-6 brutal-border brutal-shadow md:col-span-4 md:col-start-8">
            <div className="mb-4 border-b border-ink pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Inside this issue
            </div>
            <ol className="space-y-3 font-display text-xl">
              {['Write things down.', 'Mark them done.', 'Watch the percentage climb.', 'Sleep better.'].map((item, index) => (
                <li key={item} className="flex gap-3">
                  <span className="pt-1 font-mono text-xs font-semibold uppercase tracking-[0.35em] text-[#c56b18]">0{index + 1}</span>
                  <span className="text-[1.03rem]">{item}</span>
                </li>
              ))}
            </ol>
          </aside>
        </div>

        <section className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            ['Plan clearly', 'Capture priorities, due dates, and next actions in one place.'],
            ['Finish faster', 'Stay focused with visible progress and a clean task view.'],
            ['Track momentum', 'Watch your completion rate rise every day.'],
          ].map(([title, copy]) => (
            <article key={title} className="rounded-none bg-card p-6 brutal-border brutal-shadow">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Feature</p>
              <h2 className="mt-3 font-display text-2xl">{title}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{copy}</p>
            </article>
          ))}
        </section>
      </section>

      <footer className="border-t-2 border-ink mt-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 font-mono text-[11px] uppercase tracking-[0.2em]">
          <span>© Indexcard Press</span>
          <span>Printed on the internet</span>
        </div>
      </footer>
    </main>
  );
}
