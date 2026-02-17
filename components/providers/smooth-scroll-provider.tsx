"use client";

import { animate, useReducedMotion } from "framer-motion";
import { useEffect } from "react";

function getHashTarget(hash: string): HTMLElement | null {
  if (!hash || hash === "#") return null;
  const decoded = decodeURIComponent(hash.slice(1));
  if (!decoded) return null;
  const byId = document.getElementById(decoded);
  if (byId) return byId;
  return document.querySelector(`[name="${CSS.escape(decoded)}"]`);
}

export function SmoothScrollProvider() {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const root = document.documentElement;
    root.style.scrollBehavior = "smooth";

    const capture = true;
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;

      const target = event.target as Element | null;
      const anchor = target?.closest("a[href*='#']") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (!url.hash) return;
      if (url.origin !== window.location.origin) return;
      if (url.pathname !== window.location.pathname) return;

      const destination = getHashTarget(url.hash);
      if (!destination) return;

      event.preventDefault();
      const startY = window.scrollY;
      const endY = Math.max(0, destination.getBoundingClientRect().top + startY);

      if (prefersReducedMotion) {
        window.scrollTo({ top: endY, behavior: "auto" });
      } else {
        animate(startY, endY, {
          duration: 0.55,
          ease: [0.22, 1, 0.36, 1],
          onUpdate: (latest) => window.scrollTo(0, latest),
        });
      }

      history.pushState(null, "", url.hash);
    };

    document.addEventListener("click", onClick, capture);

    return () => {
      document.removeEventListener("click", onClick, capture);
      root.style.scrollBehavior = "";
    };
  }, [prefersReducedMotion]);

  return null;
}
