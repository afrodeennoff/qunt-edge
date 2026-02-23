"use client";

import dynamic from "next/dynamic";

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
  return (
    <>
      <RithmicSyncNotifications />
      <Modals />
    </>
  );
}
