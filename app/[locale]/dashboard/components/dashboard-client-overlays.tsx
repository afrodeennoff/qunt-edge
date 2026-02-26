"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Modals = dynamic(() => import("@/components/modals"), {
  ssr: false,
});

const RithmicSyncNotifications = dynamic(
  () =>
    import("./import/rithmic/sync/rithmic-notifications").then(
      (module) => module.RithmicSyncNotifications
    ),
  {
    ssr: false,
  }
);

export function DashboardClientOverlays() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const schedule: (cb: IdleRequestCallback) => number =
      window.requestIdleCallback
        ? (cb) => window.requestIdleCallback(cb)
        : (cb) => window.setTimeout(() => cb({} as IdleDeadline), 250);
    const cancel: (id: number) => void =
      window.cancelIdleCallback
        ? (id) => window.cancelIdleCallback(id)
        : (id) => window.clearTimeout(id);
    const handle = schedule(() => setReady(true));

    return () => {
      cancel(handle);
    };
  }, []);

  if (!ready) return null;

  return (
    <>
      <RithmicSyncNotifications />
      <Modals />
    </>
  );
}
