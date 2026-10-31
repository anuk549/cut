"use client";

import { useState } from "react";
import Image from "next/image";
import VesselArt from "@/components/vessel-art";

export default function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[Math.min(activeIndex, Math.max(images.length - 1, 0))];

  if (images.length === 0) {
    return (
      <div className="relative aspect-[4/5] overflow-hidden border border-line bg-sand">
        <VesselArt />
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden border border-line bg-sand">
        <Image
          src={activeImage}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1024px) 56vw, 100vw"
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-ink/10" />
        {images.length > 1 && (
          <span className="absolute bottom-4 left-4 bg-ivory/95 px-3 py-1.5 text-[0.75rem] font-medium uppercase tracking-[0.12em] text-ink/80">
            {String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              aria-pressed={index === activeIndex}
              className={`relative aspect-square overflow-hidden border transition-colors ${
                index === activeIndex ? "border-clay" : "border-line hover:border-ink/40"
              }`}
            >
              <Image src={image} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
