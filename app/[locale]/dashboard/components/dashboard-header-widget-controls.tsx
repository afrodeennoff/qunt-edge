"use client";

import React from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/app/[locale]/dashboard/dashboard-context";
import { useI18n } from "@/locales/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CheckCircle2, CloudUpload, RotateCcw, Sparkles, Trash2 } from "lucide-react";

const AddWidgetSheet = dynamic(
  () => import("@/app/[locale]/dashboard/components/add-widget-sheet").then((m) => m.AddWidgetSheet),
  { ssr: false }
);

const ShareButton = dynamic(
  () => import("./share-button").then((m) => m.ShareButton),
  { ssr: false }
);

type DashboardHeaderWidgetControlsProps = {
  isMobile: boolean;
};

export function DashboardHeaderWidgetControls({ isMobile }: DashboardHeaderWidgetControlsProps) {
  const t = useI18n();
  const {
    isCustomizing,
    toggleCustomizing,
    addWidget,
    layouts,
    autoSaveStatus,
    flushPendingSaves,
    removeAllWidgets,
    restoreDefaultLayout,
  } = useDashboard();
  const currentLayout = layouts || { desktop: [], mobile: [] };

  return (
    <div
      className={cn(
        "ml-1 flex shrink-0 items-center gap-1.5",
        isMobile
          ? "rounded-lg border border-border/35 bg-background/70 p-1"
          : "rounded-xl border border-border/50 bg-background/50 p-1.5 shadow-sm ring-1 ring-white/5 backdrop-blur-sm"
      )}
    >
      <button
        type="button"
        id="customize-mode"
        aria-label={isCustomizing ? t("widgets.done") : t("widgets.edit")}
        onClick={toggleCustomizing}
        className={cn(
          "relative group flex items-center gap-2 rounded-lg transition-all duration-300",
          isMobile ? "h-11 w-11 justify-center px-0" : "h-8 px-3",
          isCustomizing
            ? "bg-primary text-primary-foreground shadow-none"
            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        )}
      >
        <div className={cn("transition-transform duration-300", isCustomizing && "rotate-180")}>
          {isCustomizing ? <CheckCircle2 className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        </div>
        <span className={cn("text-[10px] font-bold uppercase tracking-widest", isMobile && "sr-only")}>
          {isCustomizing ? t("widgets.done") : t("widgets.edit")}
        </span>
      </button>

      {isCustomizing && (
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-px bg-border/50 mx-0.5" />
          <AddWidgetSheet onAddWidget={addWidget} isCustomizing={isCustomizing} />

          {!isMobile && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  aria-label={t("widgets.restoreDefaults")}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title={t("widgets.restoreDefaults")}
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("widgets.restoreDefaultsConfirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("widgets.restoreDefaultsConfirmDescription")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={restoreDefaultLayout}>
                    {t("widgets.confirmRestoreDefaults")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {!isMobile && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  aria-label={t("widgets.deleteAll")}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                  title={t("widgets.deleteAll")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("widgets.deleteAllConfirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("widgets.deleteAllConfirmDescription")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={removeAllWidgets}
                    className="bg-white/10 text-white hover:bg-white/20 border border-white/10"
                  >
                    {t("widgets.confirmDeleteAll")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {autoSaveStatus.hasPending ? (
            <button
              type="button"
              onClick={flushPendingSaves}
              aria-label="Save pending dashboard changes"
              className={cn(
                "flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors animate-pulse",
                isMobile ? "h-11 w-11" : "h-8 w-8"
              )}
              title="Save Changes"
            >
              <CloudUpload className="w-4 h-4" />
            </button>
          ) : (
            <div
              role="status"
              aria-label="All changes saved"
              className={cn(
                "flex items-center justify-center text-white/70",
                isMobile ? "h-11 w-11" : "h-8 w-8"
              )}
              title="All changes saved"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      )}

      {!isMobile && (
        <>
          <div className="mx-1 h-4 w-px bg-border/50" />
          <ShareButton currentLayout={currentLayout} />
        </>
      )}
    </div>
  );
}
