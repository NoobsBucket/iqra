export default function BlogPostPage({
  params,
}: {
  params: Promise<{ blog: string }>;
}) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Blog article</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">Blog article coming soon</h1>
        <p className="mt-5 text-base leading-7 text-slate-600">
          This dynamic blog post page is ready for the live content API and slug-based article routing.
        </p>
      </div>
    </main>
  );
}
