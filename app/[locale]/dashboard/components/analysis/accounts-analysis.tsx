"use client";

import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n, useCurrentLocale } from "@/locales/client";
import { useChat } from "@ai-sdk/react";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Play,
  Users,
} from "lucide-react";
import { useUserStore } from "@/store/user-store";
import { useAnalysisStore } from "@/store/analysis-store";
import { DefaultChatTransport, ToolUIPart } from "ai";
import {
  AccountAnalysisSchema,
  AccountMetricsSchema,
} from "@/app/api/ai/analysis/accounts/get-account-performance";
import { z } from "zod/v3";

// Tool types using Zod schemas
type AccountAnalysis = z.infer<typeof AccountAnalysisSchema>;
type AccountMetrics = z.infer<typeof AccountMetricsSchema>;

// Tool input/output types
type getAccountPerformanceToolInput = {
  startDate?: string;
  endDate?: string;
  minTrades?: number;
};

type getAccountPerformanceToolOutput = AccountAnalysis & {
  bestPerformingAccount?: {
    accountNumber: string;
    netPnL: number;
    winRate: number;
  };
  worstPerformingAccount?: {
    accountNumber: string;
    netPnL: number;
    winRate: number;
  };
  portfolioRisk?: string;
};

type generateAnalysisComponentToolInput = {
  locale: string;
  username?: string;
  accountData: AccountAnalysis;
};

type StructuredAnalysis = {
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
};

type generateAnalysisComponentToolOutput = {
  locale: string;
  username?: string;
  generatedAt: string;
  structuredAnalysis: StructuredAnalysis;
  dataSummary: {
    totalAccounts: number;
    totalPortfolioValue: number;
    portfolioRisk: string;
    bestAccount: string;
    worstAccount: string;
  };
  error?: boolean;
};

// Tool UI parts
type getAccountPerformanceToolUIPart = ToolUIPart<{
  getAccountPerformance: {
    input: getAccountPerformanceToolInput;
    output: getAccountPerformanceToolOutput;
  };
}>;

type generateAnalysisComponentToolUIPart = ToolUIPart<{
  generateAnalysisComponent: {
    input: generateAnalysisComponentToolInput;
    output: generateAnalysisComponentToolOutput;
  };
}>;

interface AccountsAnalysisProps {
  onStatusChange?: (status: {
    isLoading: boolean;
    hasData: boolean;
    lastUpdated: Date | null;
  }) => void;
}

export function AccountsAnalysis({ onStatusChange }: AccountsAnalysisProps) {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const { supabaseUser } = useUserStore();
  const { timezone } = useUserStore();

  // Analysis store
  const {
    accountPerformanceData: storedAccountPerformanceData,
    analysisResult: storedAnalysisResult,
    setAccountPerformanceData,
    setAnalysisResult,
    setIsLoading,
    lastUpdated,
  } = useAnalysisStore();

  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/analysis/accounts",
    }),
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  // Get the latest analysis data from tool calls
  const latestMessage = messages[messages.length - 1];
  const analysisToolCall = latestMessage?.parts?.find(
    (part) => part.type === "tool-generateAnalysisComponent",
  ) as generateAnalysisComponentToolUIPart | undefined;

  const analysisResult = analysisToolCall?.output;

  // Get account performance data from getAccountPerformance tool call
  const accountPerformanceToolCall = messages
    .flatMap((message) => message.parts || [])
    .find((part) => part.type === "tool-getAccountPerformance") as
    | getAccountPerformanceToolUIPart
    | undefined;

  const accountPerformanceData =
    accountPerformanceToolCall?.output || storedAccountPerformanceData;

  // Persist account performance data to store when it changes
  useEffect(() => {
    if (
      accountPerformanceToolCall?.output &&
      accountPerformanceToolCall.state === "output-available"
    ) {
      setAccountPerformanceData(accountPerformanceToolCall.output as any);
    }
  }, [
    accountPerformanceToolCall?.output,
    accountPerformanceToolCall?.state,
    setAccountPerformanceData,
  ]);

  // Persist analysis result to store when it changes
  useEffect(() => {
    if (
      analysisToolCall?.output &&
      analysisToolCall?.state === "output-available"
    ) {
      setAnalysisResult(analysisToolCall.output);
    }
  }, [analysisToolCall?.output, analysisToolCall?.state, setAnalysisResult]);

  // Update loading state in store
  useEffect(() => {
    setIsLoading(status === "streaming" || status === "submitted");
  }, [status, setIsLoading]);

  // Notify parent component of status changes
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange({
        isLoading: status === "streaming" || status === "submitted",
        hasData: !!(
          accountPerformanceData ||
          analysisResult ||
          storedAnalysisResult
        ),
        lastUpdated: lastUpdated,
      });
    }
  }, [
    status,
    accountPerformanceData,
    analysisResult,
    storedAnalysisResult,
    lastUpdated,
    onStatusChange,
  ]);


  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              {t("analysis.accounts.title")}
            </CardTitle>
            <CardDescription>
              {t("analysis.accounts.description")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {status === "streaming" ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  {t("analysis.loading")}
                </span>
              </div>
            ) : (
              <Button
                onClick={() =>
                  sendMessage(
                    {
                      text: `Analyze my account trading performance and provide detailed insights in ${currentLocale} language. Use the generateAnalysisComponent tool to create structured analysis components.`,
                    },
                    {
                      body: {
                        username:
                          supabaseUser?.user_metadata?.full_name ||
                          supabaseUser?.email?.split("@")[0] ||
                          "User",
                        locale: currentLocale,
                        timezone: timezone,
                        currentTime: new Date().toISOString(),
                      },
                    },
                  )
                }
                size="sm"
                variant="outline"
                disabled={status === "submitted"}
              >
                <Play className="h-4 w-4" />
                {t("analysis.generate")}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">
              {error.message || t("analysis.errorGeneric")}
            </p>
          </div>
        )}

        {/* Display all tool calls */}
        {/* {renderToolCalls()} */}

        {/* Simple Account Performance Display */}
        {accountPerformanceData && (
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t("analysis.accountPerformance")}
            </h4>

            {/* Portfolio Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    $
                    {accountPerformanceData.totalPortfolioValue?.toLocaleString() ||
                      0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("analysis.totalPortfolioValue")}
                  </p>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {accountPerformanceData.accounts?.length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("analysis.totalAccounts")}
                  </p>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold capitalize">
                    {accountPerformanceData.portfolioRisk || "N/A"}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("analysis.portfolioRisk")}
                  </p>
                </div>
              </Card>
            </div>

            {/* Account Performance Table */}
            {accountPerformanceData.accounts &&
              accountPerformanceData.accounts.length > 0 && (
                <Card className="p-4">
                  <h5 className="font-medium mb-4">
                    {t("analysis.accountComparison")}
                  </h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">
                            {t("analysis.account")}
                          </th>
                          <th className="text-left p-2 font-medium">
                            {t("analysis.netPnL")}
                          </th>
                          <th className="text-left p-2 font-medium">
                            {t("analysis.winRate")}
                          </th>
                          <th className="text-left p-2 font-medium">
                            {t("analysis.totalTrades")}
                          </th>
                          <th className="text-left p-2 font-medium">
                            {t("analysis.profitFactor")}
                          </th>
                          <th className="text-left p-2 font-medium">
                            {t("analysis.riskLevel")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {accountPerformanceData.accounts.map(
                          (account: any, index: number) => (
                            <tr key={index} className="border-b">
                              <td className="p-2 font-medium">
                                {account.accountNumber}
                              </td>
                              <td
                                className={`p-2 ${account.netPnL >= 0 ? "text-primary font-bold" : "text-destructive font-bold"}`}
                              >
                                ${account.netPnL?.toLocaleString() || 0}
                              </td>
                              <td className="p-2">
                                {account.winRate?.toFixed(1) || 0}%
                              </td>
                              <td className="p-2">
                                {account.totalTrades || 0}
                              </td>
                              <td className="p-2">
                                {account.profitFactor?.toFixed(2) || 0}
                              </td>
                              <td className="p-2">
                                <Badge
                                  variant="outline"
                                  className={
                                    account.riskLevel === "high"
                                      ? "text-destructive border-destructive/30"
                                      : account.riskLevel === "medium"
                                        ? "text-semantic-warning border-semantic-warning-border/30"
                                        : "text-foreground border-border"
                                  }
                                >
                                  {account.riskLevel || "N/A"}
                                </Badge>
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

            {/* Best/Worst Performing Accounts */}
            {(accountPerformanceData.bestPerformingAccount ||
              accountPerformanceData.worstPerformingAccount) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accountPerformanceData.bestPerformingAccount && (
                    <Card className="p-4 border-primary/20 bg-primary/5 backdrop-blur-sm">
                      <h5 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">
                        {t("analysis.bestPerformingAccount")}
                      </h5>
                      <div className="space-y-1.5 text-sm">
                        <div>
                          <strong className="text-muted-foreground">{t("analysis.account")}:</strong>{" "}
                          <span className="font-medium">{accountPerformanceData.bestPerformingAccount.accountNumber}</span>
                        </div>
                        <div>
                          <strong className="text-muted-foreground">{t("analysis.netPnL")}:</strong>{" "}
                          <span className="font-bold text-primary">
                            ${accountPerformanceData.bestPerformingAccount.netPnL?.toLocaleString() || 0}
                          </span>
                        </div>
                        <div>
                          <strong className="text-muted-foreground">{t("analysis.winRate")}:</strong>{" "}
                          <span className="font-medium">{accountPerformanceData.bestPerformingAccount.winRate?.toFixed(1) || 0}%</span>
                        </div>
                      </div>
                    </Card>
                  )}
                  {accountPerformanceData.worstPerformingAccount && (
                    <Card className="p-4 border-destructive/20 bg-destructive/5 backdrop-blur-sm">
                      <h5 className="text-[10px] font-bold uppercase tracking-widest text-destructive mb-3">
                        {t("analysis.worstPerformingAccount")}
                      </h5>
                      <div className="space-y-1.5 text-sm">
                        <div>
                          <strong className="text-muted-foreground">{t("analysis.account")}:</strong>{" "}
                          <span className="font-medium">{accountPerformanceData.worstPerformingAccount.accountNumber}</span>
                        </div>
                        <div>
                          <strong className="text-muted-foreground">{t("analysis.netPnL")}:</strong>{" "}
                          <span className="font-bold text-destructive">
                            ${accountPerformanceData.worstPerformingAccount.netPnL?.toLocaleString() || 0}
                          </span>
                        </div>
                        <div>
                          <strong className="text-muted-foreground">{t("analysis.winRate")}:</strong>{" "}
                          <span className="font-medium">{accountPerformanceData.worstPerformingAccount.winRate?.toFixed(1) || 0}%</span>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              )}
          </div>
        )}

        {/* Debug: Show raw messages */}
        {process.env.NODE_ENV === "development" && messages.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">
              Debug: Raw Messages
            </h4>
            <div className="bg-muted/50 p-4 rounded-lg">
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify(messages, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {analysisToolCall ? (
          <>
            {analysisToolCall.state === "input-available" && (
              <div className="text-center py-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    {t("analysis.loading")}
                  </span>
                </div>
              </div>
            )}

            {analysisToolCall.state === "output-available" &&
              (analysisResult || storedAnalysisResult) && (
                <>
                  {/* AI Analysis Display */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">
                        {t("analysis.aiAnalysis")}
                      </h3>
                    </div>

                    {/* Data Summary Cards */}
                    {(analysisResult || storedAnalysisResult)?.dataSummary && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                              {
                                (analysisResult || storedAnalysisResult)
                                  ?.dataSummary.totalAccounts
                              }
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {t("analysis.totalAccounts")}
                            </p>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                              $
                              {(
                                analysisResult || storedAnalysisResult
                              )?.dataSummary.totalPortfolioValue?.toLocaleString() ||
                                0}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {t("analysis.totalPortfolioValue")}
                            </p>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="text-center">
                            <div className="text-lg font-bold capitalize">
                              {
                                (analysisResult || storedAnalysisResult)
                                  ?.dataSummary.portfolioRisk
                              }
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {t("analysis.portfolioRisk")}
                            </p>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="text-center">
                            <div className="text-sm font-bold">
                              {
                                (analysisResult || storedAnalysisResult)
                                  ?.dataSummary.bestAccount
                              }
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {t("analysis.bestAccount")}
                            </p>
                          </div>
                        </Card>
                      </div>
                    )}

                    {/* Simplified 4-Part AI Analysis */}
                    {(analysisResult || storedAnalysisResult)
                      ?.structuredAnalysis && (
                        <div className="space-y-6">
                          {/* Summary */}
                          <Card className="p-6">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Activity className="h-4 w-4" />
                              {t("analysis.summary")}
                            </h4>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {
                                (analysisResult || storedAnalysisResult)
                                  ?.structuredAnalysis.summary
                              }
                            </p>
                          </Card>

                          {/* Strengths and Improvements */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="p-6 border-border/40 bg-background/30 backdrop-blur-sm">
                              <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3 text-primary">
                                {t("analysis.strengths")}
                              </h4>
                              <ul className="space-y-2">
                                {(
                                  analysisResult || storedAnalysisResult
                                )?.structuredAnalysis.strengths.map(
                                  (strength, index) => (
                                    <li
                                      key={index}
                                      className="text-sm text-muted-foreground flex items-start gap-2"
                                    >
                                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                      {strength}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </Card>

                            <Card className="p-6 border-border/40 bg-background/30 backdrop-blur-sm">
                              <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3 text-semantic-warning">
                                {t("analysis.improvements")}
                              </h4>
                              <ul className="space-y-2">
                                {(
                                  analysisResult || storedAnalysisResult
                                )?.structuredAnalysis.improvements.map(
                                  (improvement, index) => (
                                    <li
                                      key={index}
                                      className="text-sm text-muted-foreground flex items-start gap-2"
                                    >
                                      <AlertCircle className="h-4 w-4 text-semantic-warning mt-0.5 shrink-0" />
                                      {improvement}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </Card>
                          </div>

                          {/* Recommendations */}
                          <Card className="p-6 border-border/40 bg-background/30 backdrop-blur-sm">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3 text-semantic-info">
                              {t("analysis.recommendations")}
                            </h4>
                            <ul className="space-y-2">
                              {(
                                analysisResult || storedAnalysisResult
                              )?.structuredAnalysis.recommendations.map(
                                (recommendation, index) => (
                                  <li
                                    key={index}
                                    className="text-sm text-muted-foreground flex items-start gap-2"
                                  >
                                    <Play className="h-4 w-4 text-semantic-info mt-0.5 shrink-0" />
                                    {recommendation}
                                  </li>
                                ),
                              )}
                            </ul>
                          </Card>
                        </div>
                      )}

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div>
                        {t("analysis.generatedAt")}:{" "}
                        {new Date(
                          (analysisResult || storedAnalysisResult)
                            ?.generatedAt || new Date(),
                        ).toLocaleString()}
                      </div>
                      <div>{t("analysis.model")}: GPT-4o</div>
                    </div>
                  </div>
                </>
              )}

            {analysisToolCall.state === "output-error" && (
              <div className="p-4 rounded-lg bg-semantic-error-bg dark:bg-semantic-error-bg/20 border border-semantic-error-border dark:border-semantic-error-border">
                <p className="text-sm text-semantic-error dark:text-semantic-error">
                  {t("analysis.errorGeneric")}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              {error?.message || t("analysis.noData")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
