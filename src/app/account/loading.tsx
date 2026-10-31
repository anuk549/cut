export default function Loading() {
  return (
    <div className="shell py-14 lg:py-20" aria-busy="true" aria-label="Loading your account">
      <div className="animate-pulse border-b border-line pb-8">
        <div className="h-3 w-24 bg-line/70" />
        <div className="mt-4 h-11 w-64 max-w-full bg-line/70" />
        <div className="mt-4 h-4 w-44 bg-line/50" />
      </div>
      <div className="mt-12 grid gap-10 lg:grid-cols-[0.62fr_1.38fr] lg:gap-16">
        <div className="animate-pulse">
          <div className="h-3 w-20 bg-line/70" />
          <div className="mt-4 h-8 w-48 bg-line/70" />
          <div className="mt-5 h-4 w-56 max-w-full bg-line/50" />
          <div className="mt-3 h-4 w-48 max-w-full bg-line/50" />
          <div className="mt-7 h-11 w-40 bg-line/40" />
        </div>
        <div className="animate-pulse border-t border-line">
          {[0, 1, 2].map((row) => (
            <div
              key={row}
              className="flex flex-col gap-5 border-b border-line py-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-3">
                <div className="h-6 w-52 max-w-full bg-line/60" />
                <div className="h-3 w-40 bg-line/40" />
              </div>
              <div className="h-11 w-36 bg-line/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
