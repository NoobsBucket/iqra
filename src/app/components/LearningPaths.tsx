const paths = [
  {
    number: "01",
    eyebrow: "Build foundations",
    title: "Read with confidence",
    text: "Begin with recitation, pronunciation, and the daily habits that make steady study possible.",
    href: "/courses",
    action: "Explore foundations",
    accent: "border-rose-300 bg-rose-50 text-rose-700",
  },
  {
    number: "02",
    eyebrow: "Go deeper",
    title: "Understand the tradition",
    text: "Follow structured courses that connect Quranic study with context, meaning, and reflection.",
    href: "/courses",
    action: "Find your path",
    accent: "border-sky-300 bg-sky-50 text-sky-700",
  },
  {
    number: "03",
    eyebrow: "Keep the rhythm",
    title: "Make learning yours",
    text: "Return to short lessons, revise what you know, and shape a learning practice that lasts.",
    href: "/blog",
    action: "Read the journal",
    accent: "border-emerald-300 bg-emerald-50 text-emerald-700",
  },
];

export default function LearningPaths() {
  return (
    <section className="bg-[#f5f7f2] px-5 py-16 md:px-10 md:py-20" aria-labelledby="learning-paths-title">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 border-b border-black/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-600">Choose your next step</p>
            <h2 id="learning-paths-title" className="mt-3 text-3xl font-black tracking-tight text-black md:text-5xl">A path with room to grow.</h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-black/60">Small, consistent steps become a lasting relationship with learning.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {paths.map((path) => (
            <article key={path.number} className={`flex min-h-72 flex-col border p-6 rounded-md ${path.accent}`}>
              <div className="flex items-start justify-between gap-4">
                <span className="text-4xl font-black text-black">{path.number}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.18em]">{path.eyebrow}</span>
              </div>
              <div className="mt-auto">
                <h3 className="text-2xl font-black tracking-tight text-black">{path.title}</h3>
                <p className="mt-3 text-sm leading-7 text-black/65">{path.text}</p>
                <a href={path.href} className="mt-5 inline-flex text-sm font-black text-black hover:underline">{path.action} <span className="ml-2" aria-hidden="true">-&gt;</span></a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
