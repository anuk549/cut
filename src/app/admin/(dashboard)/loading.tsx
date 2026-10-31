export default function Loading() {
  return (
    <div className="grid animate-pulse gap-6 lg:grid-cols-[260px_1fr]" aria-busy="true" aria-label="Loading admin dashboard">
      <aside className="border border-line bg-ivory p-3 sm:p-4">
        <div className="space-y-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-9 bg-line/40" />
          ))}
        </div>
        <div className="mt-4 border-t border-line pt-4">
          <div className="h-3 w-16 bg-line/40" />
          <div className="mt-3 h-9 w-24 bg-line/40" />
        </div>
      </aside>
      <main className="min-w-0 space-y-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((card) => (
            <div key={card} className="border border-line bg-ivory p-5">
              <div className="h-3 w-20 bg-line/50" />
              <div className="mt-3 h-9 w-16 bg-line/60" />
            </div>
          ))}
        </div>
        <div className="border border-line bg-ivory">
          <div className="border-b border-line px-5 py-4">
            <div className="h-3 w-16 bg-line/50" />
            <div className="mt-3 h-7 w-44 bg-line/60" />
          </div>
          <div className="divide-y divide-line">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="flex items-center justify-between gap-4 p-5">
                <div className="space-y-3">
                  <div className="h-4 w-52 max-w-full bg-line/50" />
                  <div className="h-3 w-36 bg-line/40" />
                </div>
                <div className="h-4 w-24 bg-line/40" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
