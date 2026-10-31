export default function Loading() {
  return (
    <div className="pb-24" aria-busy="true" aria-label="Loading piece">
      <div className="border-b border-line">
        <div className="shell flex animate-pulse items-center gap-2 py-4">
          <div className="h-3 w-14 bg-line/50" />
          <div className="h-3 w-3 bg-line/40" />
          <div className="h-3 w-24 bg-line/50" />
          <div className="h-3 w-3 bg-line/40" />
          <div className="h-3 w-32 bg-line/50" />
        </div>
      </div>
      <div className="shell mt-6 grid animate-pulse gap-10 sm:mt-8 sm:gap-12 lg:mt-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
        <div className="aspect-[4/5] w-full bg-line/40" />
        <div>
          <div className="h-3 w-32 bg-line/50" />
          <div className="mt-5 h-12 w-3/4 bg-line/70" />
          <div className="mt-4 h-3 w-40 bg-line/50" />
          <div className="mt-8 h-10 w-36 bg-line/60" />
          <div className="mt-7 space-y-3 border-b border-line pb-6">
            <div className="h-4 w-full bg-line/40" />
            <div className="h-4 w-11/12 bg-line/40" />
            <div className="h-4 w-4/5 bg-line/40" />
          </div>
          <div className="mt-6 flex items-center justify-between border-y border-line py-4">
            <div className="h-3 w-20 bg-line/50" />
            <div className="h-3 w-12 bg-line/50" />
          </div>
          <div className="mt-8 h-[22rem] border border-line bg-paper" />
        </div>
      </div>
    </div>
  );
}
