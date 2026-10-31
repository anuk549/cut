import type { CSSProperties } from "react";

export default function VesselArt({ label = "MATI" }: { label?: string }) {
  const surface: CSSProperties = {
    backgroundImage:
      "radial-gradient(circle at 46% 30%, #fbf6ed 0%, #ede3d5 44%, #d9c8b4 100%)",
  };

  return (
    <div
      aria-hidden="true"
      className="relative flex h-full w-full items-end justify-center overflow-hidden"
      style={surface}
    >
      <div className="absolute inset-x-[12%] top-[10%] h-px bg-ink/10" />
      <div className="absolute inset-x-[18%] top-[14%] h-px bg-ink/5" />
      <div className="absolute bottom-[7%] h-[12%] w-[62%] rounded-[50%] bg-ink/15 blur-2xl" />
      <div className="relative h-[64%] w-[46%] max-w-[280px] translate-y-[5%]">
        <div className="absolute inset-0 rounded-[46%_46%_44%_44%/15%_15%_60%_60%] bg-[linear-gradient(135deg,#d99b77_0%,#b45f3c_42%,#7d3b26_100%)] shadow-[18px_28px_50px_rgba(45,33,27,0.28)]" />
        <div className="absolute left-[7%] top-[6%] h-[9%] w-[86%] rounded-[50%] bg-[#3a231b]/35 blur-[2px]" />
        <div className="absolute left-[15%] top-[13%] h-[54%] w-[12%] rounded-full bg-white/20 blur-md" />
        <div className="absolute bottom-[18%] right-[10%] h-[34%] w-[8%] rounded-full bg-ink/10 blur-md" />
      </div>
      <div className="absolute bottom-[7%] h-[6%] w-[36%] rounded-[50%] border border-ink/15" />
      <span className="absolute bottom-[8%] left-1/2 -translate-x-1/2 font-display text-[0.75rem] tracking-[0.22em] text-ink/70">
        {label}
      </span>
    </div>
  );
}
