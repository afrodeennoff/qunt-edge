"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTradovateSyncStore } from "@/store/tradovate-sync-store";
import {
  handleTradovateCallback,
} from "../components/import/tradovate/actions";
import { useI18n } from "@/locales/client";
import { useCurrentLocale } from "@/locales/client";
import { useSyncContext } from "@/context/sync-context"
import { useDashboardActions } from "@/context/data-provider"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function ImportCallbackPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useCurrentLocale();
  const oauthState = useTradovateSyncStore((state) => state.oauthState);
  const clearOAuthState = useTradovateSyncStore((state) => state.clearOAuthState);
  const clearAll = useTradovateSyncStore((state) => state.clearAll);
  const { tradovate } = useSyncContext();
  const { refreshAllData } = useDashboardActions();
  const t = useI18n();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [error, setError] = useState<string>("");
  const hasProcessed = useRef(false);
  const [storeHydrated, setStoreHydrated] = useState(false);

  useEffect(() => {
    const unsubscribe = useTradovateSyncStore.persist?.onFinishHydration?.(() => {
      setStoreHydrated(true);
    });

    if (useTradovateSyncStore.persist?.hasHydrated?.()) {
      setStoreHydrated(true);
    }

    return () => {
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    const handleCallback = async () => {
      if (!storeHydrated) {
        return;
      }

      if (hasProcessed.current) {
        return;
      }
      hasProcessed.current = true;

      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (!code) {
          setError("No authorization code received");
          setStatus("error");
          return;
        }

        if (!state) {
          setError("No state parameter received");
          setStatus("error");
          return;
        }

        const storedOAuthState =
          oauthState ??
          (typeof sessionStorage !== "undefined"
            ? sessionStorage.getItem("tradovate_oauth_state")
            : null);

        if (!storedOAuthState) {
          setError("OAuth state not found - please try again");
          setStatus("error");
          return;
        }

        if (state !== storedOAuthState) {
          setError("Invalid state parameter - possible security issue");
          setStatus("error");
          return;
        }

        const result = await handleTradovateCallback(code, state);

        if (!result || typeof result !== "object") {
          setError("Invalid response from OAuth callback handler");
          setStatus("error");
          return;
        }

        if (result.error) {
          setError(result.error);
          setStatus("error");
          return;
        }

        if (!result.success) {
          setError("Invalid response from token exchange");
          setStatus("error");
          return;
        }

        clearOAuthState();
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.removeItem("tradovate_oauth_state");
        }

        try {
          await tradovate.loadAccounts();
          await refreshAllData({ force: true });
        } catch (loadError) {
          console.warn("Failed to refresh Tradovate synchronizations", loadError);
        }

        setStatus("success");

        setTimeout(() => {
          router.push(`/${locale}/dashboard`);
        }, 1000);
      } catch (error) {
        let errorMessage = "Unknown error occurred";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        } else if (error && typeof error === "object" && "message" in error) {
          errorMessage = String(error.message);
        }

        setError(errorMessage);
        setStatus("error");
      }
    };

    handleCallback();
  }, [
    searchParams,
    oauthState,
    clearOAuthState,
    router,
    storeHydrated,
    tradovate,
    refreshAllData,
    locale,
  ]);

  const handleRetry = () => {
    hasProcessed.current = false;
    clearAll();
    router.push(`/${locale}/dashboard`);
  };

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === "loading" && (
              <Loader2 className="h-5 w-5 animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle className="h-5 w-5 text-white" />
            )}
            {status === "error" && <XCircle className="h-5 w-5 text-semantic-error" />}
            {t("tradovateSync.callback.title")}
          </CardTitle>
          <CardDescription>
            {status === "loading" && t("tradovateSync.callback.processing")}
            {status === "success" && t("tradovateSync.callback.success")}
            {status === "error" && t("tradovateSync.callback.error")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {t("tradovateSync.callback.exchangingCode")}
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center space-y-2">
              <CheckCircle className="h-12 w-12 text-white mx-auto" />
              <p className="text-sm text-muted-foreground">
                {t("tradovateSync.callback.redirecting")}
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="w-full"
                >
                  {t("tradovateSync.callback.retry")}
                </Button>
                <Button
                  onClick={() => router.push(`/${locale}/dashboard`)}
                  variant="secondary"
                  className="w-full"
                >
                  {t("tradovateSync.callback.backToDashboard")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
