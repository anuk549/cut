"use client";

import { useEffect } from "react";

const STORAGE_KEY = "mati:collection-intro";

export default function AutoScrollCollection() {
  useEffect(() => {
    if (window.location.hash) {
      try {
        window.localStorage.setItem(STORAGE_KEY, "1");
      } catch {}
      return;
    }

    try {
      if (window.localStorage.getItem(STORAGE_KEY)) return;
    } catch {}

    let finished = false;

    function remember() {
      try {
        window.localStorage.setItem(STORAGE_KEY, "1");
      } catch {}
    }

    const timer = window.setTimeout(() => {
      if (finished) return;
      finished = true;
      window.removeEventListener("scroll", onScroll);

      const target = document.getElementById("collection");
      if (!target) return;

      remember();
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    }, 3500);

    function cancel() {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      remember();
    }

    function onScroll() {
      if (window.scrollY > 40) cancel();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    if (window.scrollY > 40) cancel();

    return () => {
      finished = true;
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
