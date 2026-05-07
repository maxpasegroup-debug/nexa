export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f7f9ff] px-4 py-5 sm:px-6 md:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[28px] border border-slate-200 bg-white/86 p-4 shadow-sm">
          <div className="h-7 w-36 rounded-full c7-skeleton" />
          <div className="mt-4 h-9 w-full max-w-md rounded-2xl c7-skeleton" />
          <div className="mt-3 h-5 w-full max-w-2xl rounded-full c7-skeleton" />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.4fr]">
          <div className="h-80 rounded-[28px] c7-skeleton" />
          <div className="h-80 rounded-[28px] c7-skeleton" />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="rounded-[22px] border border-slate-200 bg-white p-4">
              <div className="h-12 w-12 rounded-[16px] c7-skeleton" />
              <div className="mt-5 h-6 w-3/4 rounded-full c7-skeleton" />
              <div className="mt-3 h-4 w-full rounded-full c7-skeleton" />
              <div className="mt-2 h-4 w-2/3 rounded-full c7-skeleton" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
