"use client";

import { useEffect } from "react";

/**
 * Prevents Radix UI Dialog from adding padding-right to body
 * Since we use scrollbar-gutter: stable, we don't need the padding
 */
export function ScrollLockFix() {
  useEffect(() => {
    const hasBlockingDialog = () =>
      Boolean(
        document.querySelector(
          [
            '[role="dialog"][data-state="open"][aria-modal="true"]',
            '[data-radix-dialog-overlay][data-state="open"]',
            '[data-radix-dialog-content][data-state="open"][aria-modal="true"]',
            '[data-radix-alert-dialog-overlay][data-state="open"]',
            '[data-radix-alert-dialog-content][data-state="open"]',
          ].join(", ")
        )
      );

    const normalizeScrollStyles = () => {
      const body = document.body;
      const html = document.documentElement;
      const dialogOpen = hasBlockingDialog();

      [body, html].forEach((element) => {
        if (element.style.paddingRight !== "0px") {
          element.style.setProperty("padding-right", "0", "important");
        }
        if (element.style.marginRight !== "0px") {
          element.style.setProperty("margin-right", "0", "important");
        }

        if (!dialogOpen) {
          element.style.removeProperty("overflow");
          element.style.removeProperty("overflow-y");
          element.style.removeProperty("overflow-x");
          element.style.removeProperty("pointer-events");
          element.style.removeProperty("touch-action");
          element.style.removeProperty("position");
          element.style.removeProperty("top");
          element.style.removeProperty("left");
          element.style.removeProperty("right");
          element.style.removeProperty("width");
          element.removeAttribute("inert");
        }
      });

      if (!dialogOpen) {
        [body, html].forEach((element) => {
          element.style.removeProperty("overflow");
          element.style.removeProperty("overflow-x");
          element.style.removeProperty("overflow-y");
          element.style.removeProperty("pointer-events");
          element.style.removeProperty("touch-action");
          element.style.removeProperty("position");
          element.style.removeProperty("top");
          element.style.removeProperty("left");
          element.style.removeProperty("right");
          element.style.removeProperty("width");
          element.removeAttribute("data-scroll-locked");
          element.removeAttribute("inert");
        });
      }
    };

    normalizeScrollStyles();

    const observer = new MutationObserver(() => {
      normalizeScrollStyles();
    });

    observer.observe(document.body, {
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
