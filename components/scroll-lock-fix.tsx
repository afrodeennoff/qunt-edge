"use client";

import { useEffect } from "react";

/**
 * Prevents Radix UI Dialog from adding padding-right to body
 * Since we use scrollbar-gutter: stable, we don't need the padding
 */
export function ScrollLockFix() {
  useEffect(() => {
    const hasOpenDialog = () =>
      Boolean(document.querySelector('[role="dialog"][data-state="open"]'));

    const normalizeScrollLock = () => {
      const body = document.body;
      const html = document.documentElement;
      const shouldPreserveLock = hasOpenDialog();

      [body, html].forEach((element) => {
        if (element.style.paddingRight !== "0px") {
          element.style.setProperty("padding-right", "0", "important");
        }
        if (element.style.marginRight !== "0px") {
          element.style.setProperty("margin-right", "0", "important");
        }
        if (!shouldPreserveLock) {
          if (element.style.overflow === "hidden") {
            element.style.removeProperty("overflow");
          }
          if (element.style.pointerEvents === "none") {
            element.style.removeProperty("pointer-events");
          }
        }
      });

      if (!shouldPreserveLock) {
        body.removeAttribute("data-scroll-locked");
        body.classList.remove("radix-scroll-lock");
        html.classList.remove("radix-scroll-lock");
      }
    };

    normalizeScrollLock();

    const observer = new MutationObserver(() => {
      normalizeScrollLock();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
