const highlights = [
  {
    number: "01",
    title: "Start with one lesson",
    text: "Build a steady learning rhythm with focused lessons you can return to whenever you are ready.",
    color: "text-rose-600",
  },
  {
    number: "02",
    title: "Learn with purpose",
    text: "Choose a course path that gives your study time structure, direction, and meaningful progress.",
    color: "text-sky-600",
  },
  {
    number: "03",
    title: "Keep moving forward",
    text: "Review your lessons, continue at your own pace, and make learning part of everyday life.",
    color: "text-emerald-600",
  },
];

export default function LearningHighlights() {
  return (
    <section className="bg-white px-5 py-16 md:px-10 md:py-20" aria-labelledby="learning-highlights-title">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-600">A better way to learn</p>
          <h2 id="learning-highlights-title" className="mt-3 text-3xl font-black tracking-tight text-black md:text-5xl">Make every study session count.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {highlights.map((highlight) => (
            <article key={highlight.number} className="border border-black/10 bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)] rounded-md">
              <p className={`text-4xl font-black ${highlight.color}`}>{highlight.number}</p>
              <h3 className="mt-8 text-xl font-black text-black">{highlight.title}</h3>
              <p className="mt-3 text-sm leading-7 text-black/65">{highlight.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
