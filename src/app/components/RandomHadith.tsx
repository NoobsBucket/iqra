const hadiths = [
  {
    text: "The best among you are those who have the best manners and character.",
    source: "Sahih al-Bukhari",
  },
  {
    text: "A kind word is charity.",
    source: "Sahih al-Bukhari and Sahih Muslim",
  },
  {
    text: "Whoever believes in Allah and the Last Day, let them speak good or remain silent.",
    source: "Sahih al-Bukhari and Sahih Muslim",
  },
];

export default function RandomHadith({ offset = 0, showHeadline = true }: { offset?: number; showHeadline?: boolean }) {
  const startIndex = Math.floor(Math.random() * hadiths.length);
  const hadith = hadiths[(startIndex + offset) % hadiths.length];

  return (
    <section className="bg-transparent px-5 py-16 md:px-10 md:py-20" aria-labelledby="hadith-title">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-md border border-black/15 bg-transparent p-7 md:p-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-4xl">
              {showHeadline ? <>
                <p className="text-sm font-black uppercase tracking-[0.24em] text-rose-600">A sunnah for today</p>
                <h2 id="hadith-title" className="mt-4 text-5xl font-black leading-none tracking-tight text-black md:text-8xl">Smile <span className="text-amber-500">it&apos;s</span> Sunnah <span className="text-sky-600">:)</span></h2>
              </> : <p className="text-sm font-black uppercase tracking-[0.24em] text-sky-600">A reminder for today</p>}
              <p className={`${showHeadline ? "mt-8" : "mt-5"} max-w-3xl text-2xl font-black leading-tight text-black md:text-4xl`}>“{hadith.text}”</p>
              <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">{hadith.source}</p>
            </div>
            {showHeadline ? <div className="grid size-20 shrink-0 place-items-center rounded-full border-4 border-amber-300 text-4xl font-black text-amber-500" aria-hidden="true">:)</div> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
