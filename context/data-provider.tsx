"use client";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Trade as PrismaTrade,
  Group as PrismaGroup,
  Account as PrismaAccount,
  Payout as PrismaPayout,
  DashboardLayout as PrismaDashboardLayout,
  Subscription as PrismaSubscription,
  Tag,
  User as PrismaUser,
  FinancialEvent,
  Mood,
  TickDetails,
} from "@/prisma/generated/prisma";
import { SharedParams } from "@/server/shared";
import {
  getUserData,
  getDashboardLayout,
  loadSharedData,
  updateIsFirstConnectionAction,
} from "@/server/user-data";
import {
  getTradesAction,
  getTradeImagesAction,
  groupTradesAction,
  ungroupTradesAction,
  updateTradesAction,
  saveDashboardLayoutAction,
  SerializedTrade,
} from "@/server/database";
import {
  deletePayoutAction,
  deleteAccountAction,
  setupAccountAction,
  savePayoutAction,
  calculateAccountBalanceAction,
  calculateAccountMetricsAction,
  deleteTradesByIdsAction,
} from "@/server/accounts";
import { computeMetricsForAccounts } from "@/lib/account-metrics";
import {
  saveGroupAction,
  deleteGroupAction,
  moveAccountToGroupAction,
  renameGroupAction,
} from "@/server/groups";
import { createClient } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";

import { signOut, getUserId, updateUserLanguage } from "@/server/auth";
import { DashboardLayoutWithWidgets, useUserStore } from "@/store/user-store";
import { useTickDetailsStore } from "@/store/tick-details-store";
import { useFinancialEventsStore } from "@/store/financial-events-store";
import { useTradesStore } from "@/store/trades-store";
import { getTradesCache, setTradesCache, getUserDataCache, setUserDataCache } from "@/lib/indexeddb/trades-cache"
import { deleteTagAction } from "@/server/tags";
import { useCurrentLocale } from "@/locales/client";
import { useMoodStore } from "@/store/mood-store";
import { useSubscriptionStore } from "@/store/subscription-store";
import { getSubscriptionData } from "@/server/billing";
import { defaultLayouts } from "@/lib/default-layouts";

import {
  generateMockTrades
} from "@/lib/mock-trades";
import { isValid, startOfDay, endOfDay } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { calculateStatistics, formatCalendarData, cn, groupBy, calculateTradingDays } from "@/lib/utils";
import { useParams } from "next/navigation";

import {
  StatisticsProps,
  CalendarData,
  DateRange,
  TickRange,
  PnlRange,
  TimeRange,
  TickFilter,
  WeekdayFilter,
  HourFilter,
  TagFilter,
  Group,
  AccountDecimalFields,
  AccountPayout,
  AccountBase,
  Account,
  AccountInput,
  GroupInput,
  Trade,
  TradeInput,
  normalizeTradeForClient,
  normalizeTradesForClient,
  normalizePayoutForClient,
  normalizeAccountForClient,
  normalizeAccountsForClient,
  normalizeGroupsForClient,
} from "@/lib/data-types";

// Combined Context Type
export interface DashboardDataState {
  isLoading: boolean;
  isMobile: boolean;
  isSharedView: boolean;
  sharedParams: SharedParams | null;
  setSharedParams: React.Dispatch<React.SetStateAction<SharedParams | null>>;
  isFirstConnection: boolean;
  setIsFirstConnection: (isFirstConnection: boolean) => void;
  trades: Trade[];
  accounts: Account[];
}

export interface DashboardFiltersState {
  instruments: string[];
  setInstruments: React.Dispatch<React.SetStateAction<string[]>>;
  accountNumbers: string[];
  setAccountNumbers: React.Dispatch<React.SetStateAction<string[]>>;
  dateRange: DateRange | undefined;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  tickRange: TickRange;
  setTickRange: React.Dispatch<React.SetStateAction<TickRange>>;
  pnlRange: PnlRange;
  setPnlRange: React.Dispatch<React.SetStateAction<PnlRange>>;
  timeRange: TimeRange;
  setTimeRange: React.Dispatch<React.SetStateAction<TimeRange>>;
  tickFilter: TickFilter;
  setTickFilter: React.Dispatch<React.SetStateAction<TickFilter>>;
  weekdayFilter: WeekdayFilter;
  setWeekdayFilter: React.Dispatch<React.SetStateAction<WeekdayFilter>>;
  hourFilter: HourFilter;
  setHourFilter: React.Dispatch<React.SetStateAction<HourFilter>>;
  tagFilter: TagFilter;
  setTagFilter: React.Dispatch<React.SetStateAction<TagFilter>>;
}

export interface DashboardDerivedState {
  formattedTrades: Trade[];
  statistics: StatisticsProps;
  calendarData: CalendarData;
}

export interface DashboardActions {
  refreshTrades: () => Promise<void>;
  refreshTradesOnly: (options?: { force?: boolean }) => Promise<void>;
  refreshUserDataOnly: (options?: { force?: boolean; includeSubscription?: boolean }) => Promise<void>;
  refreshAllData: (options?: { force?: boolean }) => Promise<void>;
  isPlusUser: () => boolean;
  changeIsFirstConnection: (isFirstConnection: boolean) => void;

  // Mutations
  // Trades
  updateTrades: (
    tradeIds: string[],
    update: Partial<Trade>
  ) => Promise<void>;
  deleteTrades: (tradeIds: string[]) => Promise<void>;
  groupTrades: (tradeIds: string[]) => Promise<void>;
  ungroupTrades: (tradeIds: string[]) => Promise<void>;
  getTradeImages: (tradeId: string) => Promise<{
    imageBase64: string | null;
    imageBase64Second: string | null;
  } | null>;

  // Accounts
  deleteAccount: (account: Account) => Promise<void>;
  saveAccount: (account: Account) => Promise<void>;

  // Groups
  saveGroup: (name: string) => Promise<Group | undefined>;
  renameGroup: (groupId: string, name: string) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  moveAccountToGroup: (
    accountId: string,
    targetGroupId: string | null
  ) => Promise<void>;
  moveAccountsToGroup: (
    accountIds: string[],
    targetGroupId: string | null
  ) => Promise<void>;

  // Payouts
  savePayout: (payout: PrismaPayout | AccountPayout) => Promise<void>;
  deletePayout: (payoutId: string) => Promise<void>;

  // Dashboard layout
  saveDashboardLayout: (layout: PrismaDashboardLayout) => Promise<void>;
}
type DataContextType = DashboardDataState &
  DashboardFiltersState &
  DashboardDerivedState &
  DashboardActions;

const DataContext = createContext<DataContextType | undefined>(undefined);
const DashboardDataStateContext = createContext<DashboardDataState | undefined>(
  undefined
);
const DashboardFiltersContext = createContext<DashboardFiltersState | undefined>(
  undefined
);
const DashboardDerivedContext = createContext<DashboardDerivedState | undefined>(
  undefined
);
const DashboardActionsContext = createContext<DashboardActions | undefined>(
  undefined
);

// Add this hook before the UserDataProvider component
function useIsMobileDetection() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 768px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mobileQuery = window.matchMedia("(max-width: 768px)");
    const checkMobile = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile(e.matches);

    // Check immediately
    checkMobile(mobileQuery);

    // Add listener for changes
    mobileQuery.addEventListener("change", checkMobile);
    return () => mobileQuery.removeEventListener("change", checkMobile);
  }, []);

  return isMobile;
}

export const DataProvider: React.FC<{
  children: React.ReactNode;
  isSharedView?: boolean;
  initialSharedSlug?: string;
  initialSharedData?: {
    params: SharedParams;
    trades: Trade[];
    groups: GroupInput[];
  } | null;
  adminView?: {
    userId: string;
  };
}> = ({
  children,
  isSharedView = false,
  initialSharedSlug,
  initialSharedData = null,
  adminView = null,
}) => {
  const supabase = useMemo(() => createClient(), []);
  const params = useParams();
  const isMobile = useIsMobileDetection();

  // Get store values
  const setUser = useUserStore((state) => state.setUser);
  const setSubscription = useUserStore((state) => state.setSubscription);
  const setTags = useUserStore((state) => state.setTags);
  const setAccounts = useUserStore((state) => state.setAccounts);
  const setGroups = useUserStore((state) => state.setGroups);
  const setDashboardLayout = useUserStore((state) => state.setDashboardLayout);
  const setMoods = useMoodStore((state) => state.setMoods);
  const supabaseUser = useUserStore((state) => state.supabaseUser);
  const timezone = useUserStore((state) => state.timezone);
  const groups = useUserStore((state) => state.groups);
  const accounts = useUserStore((state) => state.accounts);
  const setSupabaseUser = useUserStore((state) => state.setSupabaseUser);
  const setTickDetails = useTickDetailsStore((state) => state.setTickDetails);
  const tickDetails = useTickDetailsStore((state) => state.tickDetails);
  const setEvents = useFinancialEventsStore((state) => state.setEvents);
  const trades = useTradesStore((state) => state.trades);
  const setTrades = useTradesStore((state) => state.setTrades);
  const dashboardLayout = useUserStore((state) => state.dashboardLayout);
  const locale = useCurrentLocale();
  const isLoading = useUserStore((state) => state.isLoading);
  const setIsLoading = useUserStore((state) => state.setIsLoading);

  // Subscription store
  const setSubscriptionData = useSubscriptionStore(
    (state) => state.setSubscription
  );
  const setSubscriptionLoading = useSubscriptionStore(
    (state) => state.setIsLoading
  );
  const setSubscriptionError = useSubscriptionStore(
    (state) => state.setError
  );
  const bootstrappedSharedSlugRef = useRef<string | null>(null);

  const buildSharedAccountNumbers = useCallback(
    (sharedData: NonNullable<typeof initialSharedData>) =>
      sharedData.params.accountNumbers.length > 0
        ? sharedData.params.accountNumbers
        : Array.from(new Set(sharedData.trades.map((trade) => trade.accountNumber))),
    []
  );

  const buildSharedParams = useCallback(
    (sharedData: NonNullable<typeof initialSharedData>) => ({
      ...sharedData.params,
      accountNumbers: buildSharedAccountNumbers(sharedData),
    }),
    [buildSharedAccountNumbers]
  );

  const prepareSharedTrades = useCallback(
    (incomingTrades: Trade[]) =>
      incomingTrades
        .filter((trade) => isValid(new Date(trade.entryDate)))
        .map((trade) => {
          let utcDateStr = "";
          try {
            utcDateStr = formatInTimeZone(
              new Date(trade.entryDate),
              timezone || "UTC",
              "yyyy-MM-dd"
            );
          } catch (error) {
            console.error("Error formatting trade date:", trade.id, error);
          }

          return {
            ...trade,
            utcDateStr,
          };
        }),
    [timezone]
  );

  // Local states
  const [sharedParams, setSharedParams] = useState<SharedParams | null>(() =>
    initialSharedData ? buildSharedParams(initialSharedData) : null
  );

  // Filter states
  const [instruments, setInstruments] = useState<string[]>([]);
  const [accountNumbers, setAccountNumbers] = useState<string[]>(() =>
    initialSharedData ? buildSharedAccountNumbers(initialSharedData) : []
  );
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [tickRange, setTickRange] = useState<TickRange>({
    min: undefined,
    max: undefined,
  });
  const [pnlRange, setPnlRange] = useState<PnlRange>({
    min: undefined,
    max: undefined,
  });
  const [timeRange, setTimeRange] = useState<TimeRange>({ range: null });
  const [tickFilter, setTickFilter] = useState<TickFilter>({ value: null });
  const [weekdayFilter, setWeekdayFilter] = useState<WeekdayFilter>({
    days: [],
  });
  const [hourFilter, setHourFilter] = useState<HourFilter>({ hour: null });
  const [tagFilter, setTagFilter] = useState<TagFilter>({ tags: [] });
  const [isFirstConnection, setIsFirstConnection] = useState(false);

  // Sanitize trades to prevent NaN/Infinity poisoning from bad cache/data
  const sanitizeTradesForState = useCallback((incomingTrades: Trade[]) => {
    if (!Array.isArray(incomingTrades)) return [];
    return incomingTrades
      .map((t) => ({
        ...t,
        pnl: Number.isFinite(Number(t.pnl)) ? Number(t.pnl) : 0,
        entryPrice: Number.isFinite(Number(t.entryPrice)) ? Number(t.entryPrice) : 0,
        quantity: Number.isFinite(Number(t.quantity)) ? Number(t.quantity) : 0,
        commission: Number.isFinite(Number(t.commission)) ? Number(t.commission) : 0,
      }))
      .filter((t) => isValid(new Date(t.entryDate)));
  }, []);

  const withTimeout = useCallback(
    async <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`[DataProvider] Timeout after ${ms}ms: ${label}`));
        }, ms);
      });

      try {
        return await Promise.race([promise, timeoutPromise]);
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    },
    []
  );

  const fetchAllTrades = useCallback(
    async (userId: string | null = null, force: boolean = false): Promise<Trade[]> => {
      const allTrades: Trade[] = [];
      let page = 1;
      let hasMore = true;
      const pageSize = 500;

      while (hasMore) {
        const response = await withTimeout(
          getTradesAction(userId, page, pageSize, force && page === 1),
          15000,
          `getTradesAction(page=${page})`
        );
        const pageTrades = Array.isArray(response?.trades)
          ? normalizeTradesForClient(response.trades as (PrismaTrade | SerializedTrade)[])
          : [];

        allTrades.push(...pageTrades);
        hasMore = Boolean(response?.metadata?.hasMore) && pageTrades.length > 0;
        page += 1;
      }

      return allTrades;
    },
    [withTimeout]
  );

  const syncSharedDataState = useCallback(
    (sharedData: NonNullable<typeof initialSharedData>) => {
      const hydratedSharedParams = buildSharedParams(sharedData);
      const sharedGroups = normalizeGroupsForClient(sharedData.groups || []);
      const sharedAccounts = normalizeAccountsForClient(
        (sharedData.groups?.flatMap((group) => group.accounts) || []) as AccountInput[]
      );

      setTrades(sanitizeTradesForState(prepareSharedTrades(sharedData.trades)));
      setSharedParams(hydratedSharedParams);
      setAccountNumbers(hydratedSharedParams.accountNumbers);
      setDashboardLayout(defaultLayouts);
      setGroups(sharedGroups);
      setAccounts(sharedAccounts);

      if (sharedData.params.tickDetails) {
        setTickDetails(sharedData.params.tickDetails);
      }

      return sharedAccounts;
    },
    [
      buildSharedParams,
      prepareSharedTrades,
      sanitizeTradesForState,
      setAccounts,
      setDashboardLayout,
      setGroups,
      setTickDetails,
      setTrades,
    ]
  );

  const hydrateSharedAccountMetrics = useCallback(
    async (sharedAccounts: Account[]) => {
      let accountsWithMetrics = sharedAccounts;
      try {
        accountsWithMetrics = await withTimeout(
          calculateAccountMetricsAction(sharedAccounts),
          15000,
          "calculateAccountMetricsAction(shared)"
        );
      } catch (error) {
        console.error(
          "[DataProvider] Account metrics timed out for shared view; continuing without metrics",
          error
        );
      }

      setAccounts(normalizeAccountsForClient(accountsWithMetrics));
    },
    [setAccounts, withTimeout]
  );

  // Load data from the server
  const loadData = useCallback(async () => {
    // Prevent multiple simultaneous loads
    try {
      setIsLoading(true);

      if (isSharedView) {
        if (initialSharedData) {
          const sharedAccounts = syncSharedDataState(initialSharedData);
          await hydrateSharedAccountMetrics(sharedAccounts);
          setIsLoading(false);
          return;
        }

        const sharedData = await withTimeout(
          loadSharedData(params.slug as string),
          15000,
          "loadSharedData"
        );
        if (!sharedData.error) {
          const sharedAccounts = syncSharedDataState({
            params: sharedData.params,
            trades: sharedData.trades as Trade[],
            groups: (sharedData.groups || []) as GroupInput[],
          });
          await hydrateSharedAccountMetrics(sharedAccounts);
        }
        setIsLoading(false);
        return;
      }

      if (adminView) {
        const adminTrades = await withTimeout(
          fetchAllTrades(adminView.userId as string, false),
          20000,
          "fetchAllTrades(admin)"
        );
        setTrades(sanitizeTradesForState(adminTrades));
        // RESET ALL OTHER STATES
        setUser(null);
        setSubscription(null);
        setTags([]);
        setGroups([]);
        setMoods([]);
        setEvents([]);
        setTickDetails([]);
        setAccounts([]);
        setGroups([]);
        setDashboardLayout({
          id: "admin-layout",
          userId: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
          desktop: defaultLayouts.desktop,
          mobile: defaultLayouts.mobile,
        });
        return;
      }

      // Step 1: Get Supabase user
      const {
        data: { user },
      } = await withTimeout(supabase.auth.getUser(), 15000, "supabase.auth.getUser");

      if (!user?.id) {
        await signOut();
        setIsLoading(false);
        return;
      }

      setSupabaseUser(user);

      // CRITICAL: Get dashboard layout first
      // But check if the layout is already in the state
      if (!dashboardLayout) {
        const userId = await withTimeout(getUserId(), 15000, "getUserId(for layout)");
        const dashboardLayoutResponse = await withTimeout(
          getDashboardLayout(userId),
          15000,
          "getDashboardLayout"
        );
        if (dashboardLayoutResponse) {
          setDashboardLayout(
            dashboardLayoutResponse as unknown as DashboardLayoutWithWidgets
          );
        } else {
          // If no layout exists in database, use default layout
          setDashboardLayout(defaultLayouts);
        }
      }

      // Step 2: Fetch trades (with caching server side)
      const userId = await withTimeout(getUserId(), 15000, "getUserId(for trades)");
      if (userId && !isSharedView) {
        // Try local cache first
        const cachedTrades = await withTimeout(getTradesCache(userId), 2000, "getTradesCache");
        if (cachedTrades && Array.isArray(cachedTrades) && cachedTrades.length > 0) {
          setTrades(sanitizeTradesForState(cachedTrades as Trade[]));

          // Refresh in background if not in dev or if we want freshest data
          fetchAllTrades(userId, false).then(freshTrades => {
            if (freshTrades && freshTrades.length > 0) {
              setTrades(sanitizeTradesForState(freshTrades));
              setTradesCache(userId, freshTrades).catch(console.error);
            }
          }).catch(console.error);
        } else {
          if (!userId) return;

          const safeTrades = await withTimeout(
            fetchAllTrades(userId, false),
            20000,
            "fetchAllTrades(user)"
          );

          // Only use mock data in development — never show fake data in production
          const tradesToUse = safeTrades.length > 0
            ? safeTrades
            : process.env.NODE_ENV === 'development'
              ? generateMockTrades(userId || "demo-user")
              : [];
          setTrades(sanitizeTradesForState(tradesToUse));
          if (tradesToUse.length > 0) {
            setTradesCache(userId, tradesToUse).catch(console.error);
          }
        }
      } else {
        const safeTrades = await withTimeout(fetchAllTrades(null, false), 20000, "fetchAllTrades(anonymous)");
        setTrades(sanitizeTradesForState(safeTrades));
      }

      // Step 3: Fetch user data
      // Check local cache for user data
      if (userId && !isSharedView) {
        const cachedUserData = await withTimeout(getUserDataCache(userId), 2000, "getUserDataCache");
        if (cachedUserData) {
          // Apply cached data immediately
          const normalizedAccounts = normalizeAccountsForClient(cachedUserData.accounts);
          setAccounts(normalizedAccounts);
          setUser(cachedUserData.userData);
          setSubscription(cachedUserData.subscription as PrismaSubscription | null);
          setTags(cachedUserData.tags);
          setGroups(normalizeGroupsForClient(cachedUserData.groups));
          setMoods(cachedUserData.moodHistory);
          setEvents(cachedUserData.financialEvents);
          setTickDetails(cachedUserData.tickDetails);
        }
      }

      const data = await withTimeout(getUserData(), 20000, "getUserData");

      if (!data) {
        await signOut();
        setIsLoading(false);
        return;
      }

      // Calculate metrics for each account
      const normalizedAccounts = normalizeAccountsForClient(
        (data.accounts || []) as AccountInput[]
      );
      let accountsWithMetrics = normalizedAccounts;
      try {
        accountsWithMetrics = await withTimeout(
          calculateAccountMetricsAction(normalizedAccounts),
          20000,
          "calculateAccountMetricsAction"
        );
      } catch (e) {
        console.error("[DataProvider] Account metrics timed out; continuing without metrics", e);
      }
      setAccounts(normalizeAccountsForClient(accountsWithMetrics));

      setUser(data.userData);
      setSubscription(data.subscription as PrismaSubscription | null);
      setTags(data.tags);
      setGroups(normalizeGroupsForClient(data.groups as GroupInput[]));
      setMoods(data.moodHistory);
      setEvents(data.financialEvents);
      setTickDetails(data.tickDetails);
      setIsFirstConnection(data.userData?.isFirstConnection || false);

      // Save to local cache in background
      if (userId && !isSharedView) {
        setUserDataCache(userId, {
          userData: data.userData,
          subscription: data.subscription as PrismaSubscription | null,
          tickDetails: data.tickDetails,
          tags: data.tags,
          accounts: normalizeAccountsForClient((data.accounts || []) as AccountInput[]),
          groups: normalizeGroupsForClient((data.groups || []) as GroupInput[]),
          financialEvents: data.financialEvents,
          moodHistory: data.moodHistory
        }).catch(console.error);
      }
    } catch (error) {
      console.error("[DataProvider] FATAL: Error loading data:", error);
      // Only fallback to mock data in development
      if (process.env.NODE_ENV === 'development') {
        const currentUserId = (await getUserId().catch(() => null)) || "error-fallback";
        console.warn("[DataProvider] Falling back to mock data due to error for user:", currentUserId);
        setTrades(sanitizeTradesForState(generateMockTrades(currentUserId)));
      } else {
        setTrades([]);
      }
      setAccounts([]);
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    isSharedView,
    initialSharedData,
    params?.slug,
    fetchAllTrades,
    hydrateSharedAccountMetrics,
    setIsLoading,
    syncSharedDataState,
    withTimeout,
    supabase,
  ]);

  useLayoutEffect(() => {
    if (!isSharedView || !initialSharedData || !initialSharedSlug) return;
    if (bootstrappedSharedSlugRef.current === initialSharedSlug) return;

    bootstrappedSharedSlugRef.current = initialSharedSlug;
    const sharedAccounts = syncSharedDataState(initialSharedData);
    setIsLoading(false);
    hydrateSharedAccountMetrics(sharedAccounts).catch((error) => {
      console.error("[DataProvider] Failed to hydrate shared account metrics", error);
    });
  }, [
    hydrateSharedAccountMetrics,
    initialSharedData,
    initialSharedSlug,
    isSharedView,
    setIsLoading,
    syncSharedDataState,
  ]);

  // Load data on mount and when isSharedView changes
  useEffect(() => {
    let mounted = true;

    const loadDataIfMounted = async () => {
      if (!mounted) return;
      if (isSharedView && initialSharedData) {
        return;
      }
      await loadData();
      if (isSharedView) return;
      // Load Whop subscription data
      try {
        setSubscriptionLoading(true);
        const subscriptionData = await getSubscriptionData();
        setSubscriptionData(subscriptionData);
        setSubscriptionError(null);
      } catch (error) {
        console.error("Error loading Whop subscription:", error);
        setSubscriptionError(
          error instanceof Error ? error.message : "Failed to load subscription"
        );
        setSubscriptionData(null);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    loadDataIfMounted();

    return () => {
      mounted = false;
    };
  }, [isSharedView, initialSharedData, loadData]);

  // Persist language changes without blocking UI
  useEffect(() => {
    const updateLanguage = async () => {
      if (!supabaseUser?.id || !locale) return;
      // Fire and forget; do not block UI
      await updateUserLanguage(locale).catch((e) => {
        console.error("[DataProvider] Failed to update user language", e);
      });
    };
    updateLanguage();
  }, [locale, supabaseUser?.id]);

  const loadSubscriptionData = useCallback(async () => {
    try {
      setSubscriptionLoading(true);
      const subscriptionData = await getSubscriptionData();
      setSubscriptionData(subscriptionData);
      setSubscriptionError(null);
    } catch (error) {
      console.error("Error loading Whop subscription:", error);
      setSubscriptionError(
        error instanceof Error ? error.message : "Failed to load subscription"
      );
      setSubscriptionData(null);
    } finally {
      setSubscriptionLoading(false);
    }
  }, []);

  const refreshTradesOnly = useCallback(
    async (options?: { force?: boolean; withLoading?: boolean }) => {
      if (!supabaseUser?.id) return;
      const { force = false, withLoading = true } = options || {};

      if (withLoading) setIsLoading(true);

      try {
        const userId = await getUserId();
        if (!userId) return;

        // Dev-only: serve trades from IndexedDB to avoid DB hits when possible
        if (process.env.NODE_ENV === "development" && !force) {
          const cachedTrades = await getTradesCache(userId);
          if (cachedTrades && Array.isArray(cachedTrades) && cachedTrades.length > 0) {
            setTrades(sanitizeTradesForState(cachedTrades));
            if (withLoading) setIsLoading(false);
            return;
          }
        }

        const safeTrades = await fetchAllTrades(userId, force);
        const tradesToUse =
          process.env.NODE_ENV === "development" && safeTrades.length === 0
            ? generateMockTrades(userId)
            : safeTrades;
        setTrades(sanitizeTradesForState(tradesToUse));

        if (process.env.NODE_ENV === "development") {
          // Best-effort cache write; do not block UI on failure
          setTradesCache(userId, tradesToUse).catch((err) =>
            console.error("[refreshTradesOnly] Failed to cache trades in IndexedDB", err),
          );
        }
      } catch (error) {
        console.error("Error refreshing trades:", error);
      } finally {
        if (withLoading) setIsLoading(false);
      }
    },
    [supabaseUser?.id, setTrades, fetchAllTrades]
  );

  const refreshUserDataOnly = useCallback(
    async (
      options?: { force?: boolean; includeSubscription?: boolean; withLoading?: boolean }
    ) => {
      if (!supabaseUser?.id) return;
      const {
        force = false,
        includeSubscription = false,
        withLoading = true,
      } = options || {};

      if (withLoading) setIsLoading(true);

      try {
        const data = await getUserData(force);

        if (!data) {
          await signOut();
          return;
        }

        const normalizedAccounts = normalizeAccountsForClient(
          (data.accounts || []) as AccountInput[]
        );
        const accountsWithMetrics = await calculateAccountMetricsAction(
          normalizedAccounts
        );
        setAccounts(normalizeAccountsForClient(accountsWithMetrics));

        setUser(data.userData);
        setSubscription(data.subscription as PrismaSubscription | null);
        setTags(data.tags);
        setGroups(normalizeGroupsForClient(data.groups as GroupInput[]));
        setMoods(data.moodHistory);
        setEvents(data.financialEvents);
        setTickDetails(data.tickDetails);
        setIsFirstConnection(data.userData?.isFirstConnection || false);

        if (includeSubscription) {
          await loadSubscriptionData();
        }
      } catch (error) {
        console.error("Error refreshing user data:", error);
      } finally {
        if (withLoading) setIsLoading(false);
      }
    },
    [
      supabaseUser?.id,
      setAccounts,
      setUser,
      setSubscription,
      setTags,
      setGroups,
      setMoods,
      setEvents,
      setTickDetails,
      setIsFirstConnection,
      loadSubscriptionData,
    ]
  );

  const refreshAllData = useCallback(
    async (options?: { force?: boolean }) => {
      if (!supabaseUser?.id) return;
      const force = options?.force ?? false;

      setIsLoading(true);
      try {
        await refreshTradesOnly({ force, withLoading: false });
        await refreshUserDataOnly({
          force,
          includeSubscription: true,
          withLoading: false,
        });
      } catch (error) {
        console.error("Error refreshing all data:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [refreshTradesOnly, refreshUserDataOnly, supabaseUser?.id]
  );

  // Dev-only: persist trades store into IndexedDB so reloads avoid DB hits
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (!supabaseUser?.id) return;
    if (!Array.isArray(trades)) return;
    if (trades.length === 0) return; // avoid caching empty and blocking future fetches

    const timer = window.setTimeout(() => {
      setTradesCache(supabaseUser.id, trades).catch((err) =>
        console.error("[DataProvider] Failed to sync trades to IndexedDB", err),
      );
    }, 200);

    return () => window.clearTimeout(timer);
  }, [trades, supabaseUser?.id]);

  const formattedTrades = useMemo(() => {
    if (!Array.isArray(trades) || trades.length === 0) {
      return [];
    }

    const hiddenGroupId = groups.find((group) => group.name === "Hidden Accounts")?.id;
    const hiddenAccountNumbers = hiddenGroupId
      ? new Set(
        accounts
          .filter((account) => account.groupId === hiddenGroupId)
          .map((account) => account.number)
      )
      : null;

    const accountByNumber = new Map(accounts.map((account) => [account.number, account]));
    const instrumentFilterSet = instruments.length > 0 ? new Set(instruments) : null;
    const accountFilterSet = accountNumbers.length > 0 ? new Set(accountNumbers) : null;
    const tagFilterSet = tagFilter.tags.length > 0 ? new Set(tagFilter.tags) : null;

    const fromDate = dateRange?.from ? startOfDay(dateRange.from) : null;
    const toDate = dateRange?.to ? endOfDay(dateRange.to) : null;
    const singleDayTimestamp =
      fromDate && toDate && fromDate.getTime() === startOfDay(toDate).getTime()
        ? fromDate.getTime()
        : null;

    // Extract times to avoid redundant object parsing inside the filter loop
    const fromTime = fromDate?.getTime() ?? null;
    const toTime = toDate?.getTime() ?? null;

    // Pre-calculate account reset times
    const accountResetTimes = new Map<string, number>();
    for (const account of accounts) {
        if (account.resetDate && account.shouldConsiderTradesBeforeReset === false) {
            accountResetTimes.set(account.number, startOfDay(new Date(account.resetDate)).getTime());
        }
    }

    const tickFilterValue = tickFilter?.value
      ? Number(tickFilter.value.replace("+", ""))
      : null;
    const sortedTickers =
      tickFilterValue !== null
        ? Object.keys(tickDetails).sort((first, second) => second.length - first.length)
        : [];

    const timezoneName = timezone || "UTC";

    return trades
      .filter((trade) => {
        if (hiddenAccountNumbers?.has(trade.accountNumber)) return false;

        const tradeAccount = accountByNumber.get(trade.accountNumber);
        const rawDate = new Date(trade.entryDate);
        if (!isValid(rawDate)) return false;

        let entryDate = rawDate;
        try {
          entryDate = toZonedTime(rawDate, timezoneName);
        } catch {
          entryDate = rawDate;
        }

        if (!isValid(entryDate)) return false;

        const resetTime = accountResetTimes.get(trade.accountNumber);
        if (resetTime !== undefined && startOfDay(entryDate).getTime() < resetTime) {
            return false;
        }

        if (instrumentFilterSet && !instrumentFilterSet.has(trade.instrument)) return false;
        if (accountFilterSet && !accountFilterSet.has(trade.accountNumber)) return false;

        const entryTime = entryDate.getTime();
        if (fromTime !== null && entryTime < fromTime) return false;
        if (toTime !== null && entryTime > toTime) return false;
        if (singleDayTimestamp !== null && startOfDay(entryDate).getTime() !== singleDayTimestamp) {
          return false;
        }

        const tradePnl = Number(trade.pnl);
        if (pnlRange.min !== undefined && tradePnl < pnlRange.min) return false;
        if (pnlRange.max !== undefined && tradePnl > pnlRange.max) return false;

        if (tickFilterValue !== null) {
          const matchingTicker = sortedTickers.find((ticker) => trade.instrument.includes(ticker));
          const rawTickValue = matchingTicker
            ? Number(tickDetails[matchingTicker]?.tickValue)
            : 1;
          const tickValue =
            Number.isFinite(rawTickValue) && rawTickValue !== 0 ? rawTickValue : 1;

          const quantity = Number(trade.quantity);
          if (!Number.isFinite(quantity) || quantity === 0) return false;

          const tradeTicks = Math.round((tradePnl / quantity) / tickValue);
          if (tradeTicks !== tickFilterValue) return false;
        }

        if (timeRange.range && getTimeRangeKey(Number(trade.timeInPosition)) !== timeRange.range) {
          return false;
        }

        if (weekdayFilter.days.length > 0 && !weekdayFilter.days.includes(entryDate.getDay())) {
          return false;
        }

        if (hourFilter.hour !== null && entryDate.getHours() !== hourFilter.hour) {
          return false;
        }

        if (tagFilterSet) {
          if (!Array.isArray(trade.tags)) return false;
          if (!trade.tags.some((tag) => tagFilterSet.has(tag))) return false;
        }

        return true;
      })
      .sort(
        (first, second) =>
          new Date(first.entryDate).getTime() - new Date(second.entryDate).getTime()
      );
  }, [
    trades,
    groups,
    accounts,
    instruments,
    accountNumbers,
    dateRange?.from,
    dateRange?.to,
    pnlRange.min,
    pnlRange.max,
    tickFilter?.value,
    tickDetails,
    timeRange.range,
    weekdayFilter.days,
    hourFilter.hour,
    tagFilter.tags,
    timezone,
  ]);

  const statistics = useMemo(() => {
    const stats = calculateStatistics(formattedTrades, accounts);

    // Calculate gross profits and gross losses including commissions
    const grossProfits = formattedTrades.reduce((sum, trade) => {
      const totalPnL = (trade.pnl || 0) - (trade.commission || 0);
      return totalPnL > 0 ? sum + totalPnL : sum;
    }, 0);

    const grossLosses = Math.abs(
      formattedTrades.reduce((sum, trade) => {
        const totalPnL = (trade.pnl || 0) - (trade.commission || 0);
        return totalPnL < 0 ? sum + totalPnL : sum;
      }, 0)
    );

    // Calculate profit factor (handle division by zero)
    const profitFactor =
      grossLosses === 0
        ? grossProfits > 0
          ? Number.POSITIVE_INFINITY
          : 1
        : grossProfits / grossLosses;

    return {
      ...stats,
      profitFactor,
    };
  }, [formattedTrades, accounts]);

  const calendarData = useMemo(
    () => formatCalendarData(formattedTrades, accounts),
    [formattedTrades, accounts]
  );

  const isPlusUser = () => {
    // Use Whop subscription store for more accurate subscription status
    const whopSubscription = useSubscriptionStore.getState().subscription;
    if (whopSubscription) {
      const planName = whopSubscription.plan?.name?.toLowerCase() || "";
      return planName.includes("plus") || planName.includes("pro");
    }

    // Fallback to database subscription
    const dbSubscription = useUserStore.getState().subscription;
    return Boolean(
      dbSubscription?.status === "ACTIVE" &&
      ["PLUS", "PRO"].includes(
        dbSubscription?.plan?.split("_")[0].toUpperCase() || ""
      )
    );
  };

  const saveAccount = useCallback(
    async (newAccount: Account) => {
      if (!supabaseUser?.id) return;

      try {
        // Get the current account to preserve other properties
        const { accounts } = useUserStore.getState();
        const currentAccount = accounts.find(
          (acc) => acc.number === newAccount.number
        ) as Account;
        // If the account is not found, create it
        if (!currentAccount) {
          // Never send client-only fields to server
          const { trades: _trades, ...serverAccount } = newAccount;
          const considerBuffer = newAccount.considerBuffer ?? true;
          const createdAccount = await setupAccountAction(
            serverAccount as Account
          );

          // Recalculate metrics for the new account (optimistic, client-side)
          const accountsWithMetrics = computeMetricsForAccounts(
            [
              {
                ...createdAccount,
                considerBuffer: createdAccount.considerBuffer ?? considerBuffer,
              },
            ],
            trades
          );
          const accountWithMetrics = normalizeAccountForClient(accountsWithMetrics[0]);

          setAccounts([...accounts, accountWithMetrics]);

          // If the new account has a groupId, update the groups state to include it
          if (accountWithMetrics.groupId) {
            setGroups(
              groups.map((group) => {
                if (group.id === accountWithMetrics.groupId) {
                  return {
                    ...group,
                    accounts: [...group.accounts, accountWithMetrics],
                  };
                }
                return group;
              })
            );
          }
          return;
        }

        // Update the account in the database
        // Strip client-only fields
        const { trades: _trades2, ...serverAccount2 } = newAccount;
        const considerBuffer = newAccount.considerBuffer ?? true;
        const updatedAccount = await setupAccountAction(
          serverAccount2 as Account
        );

        // Recalculate metrics for the updated account (optimistic, client-side)
        const accountsWithMetrics = computeMetricsForAccounts(
          [
            {
              ...updatedAccount,
              considerBuffer: updatedAccount.considerBuffer ?? considerBuffer,
            },
          ],
          trades
        );
        const accountWithMetrics = normalizeAccountForClient(accountsWithMetrics[0]);

        // Check if groupId changed
        const oldGroupId = currentAccount.groupId;
        const newGroupId = accountWithMetrics.groupId;
        const groupIdChanged = oldGroupId !== newGroupId;

        // Update the account in the local state with recalculated metrics
        const updatedAccounts = accounts.map((account: Account) => {
          if (account.number === accountWithMetrics.number) {
            return accountWithMetrics;
          }
          return account;
        });
        setAccounts(updatedAccounts);

        // Update groups state if groupId changed
        if (groupIdChanged) {
          // Get fresh groups from store to avoid stale closure references
          const currentGroups = useUserStore.getState().groups;

          // Check if the target group exists in the groups array
          const targetGroupExists = currentGroups.some(
            (g) => g.id === newGroupId
          );

          if (targetGroupExists) {
            // Update existing groups
            setGroups(
              currentGroups.map((group) => {
                // If this is the new target group, add the account only if it's not already there
                if (group.id === newGroupId) {
                  const accountExists = group.accounts.some(
                    (acc: Account) =>
                      acc.id === accountWithMetrics.id ||
                      acc.number === accountWithMetrics.number
                  );
                  return {
                    ...group,
                    accounts: accountExists
                      ? group.accounts
                      : [...group.accounts, accountWithMetrics],
                  };
                }
                // For all other groups (including the old group), remove the account if it exists
                return {
                  ...group,
                  accounts: group.accounts.filter(
                    (acc: Account) =>
                      acc.id !== accountWithMetrics.id &&
                      acc.number !== accountWithMetrics.number
                  ),
                };
              })
            );
          } else if (newGroupId) {
            // If the group doesn't exist yet (just created), we need to add it
            // This can happen if a group was just created and saveAccount is called immediately
            // Try to fetch the group from the database, or create a minimal group object
            try {
              const { getGroupsAction } = await import("@/server/groups");
              const allGroups = await getGroupsAction();
              const foundGroup = allGroups.find((g) => g.id === newGroupId);

              if (foundGroup) {
                // Use the actual group from database
                const updatedGroups = currentGroups.map((group) => ({
                  ...group,
                  accounts: group.accounts.filter(
                    (acc: Account) =>
                      acc.id !== accountWithMetrics.id &&
                      acc.number !== accountWithMetrics.number
                  ),
                }));
                setGroups([
                  ...updatedGroups,
                  ...normalizeGroupsForClient([{ ...foundGroup, accounts: [accountWithMetrics] } as Group]),
                ]);
              } else {
                // Fallback: create minimal group object (shouldn't happen, but just in case)
                const newGroup = {
                  id: newGroupId,
                  name: "New Group", // Temporary name
                  userId: supabaseUser.id,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  accounts: [accountWithMetrics],
                };

                const updatedGroups = currentGroups.map((group) => ({
                  ...group,
                  accounts: group.accounts.filter(
                    (acc: Account) =>
                      acc.id !== accountWithMetrics.id &&
                      acc.number !== accountWithMetrics.number
                  ),
                }));

                setGroups([...updatedGroups, newGroup]);
              }
            } catch (error) {
              console.error("Error fetching group:", error);
              // Fallback: create minimal group object
              const newGroup = {
                id: newGroupId,
                name: "New Group",
                userId: supabaseUser.id,
                createdAt: new Date(),
                updatedAt: new Date(),
                accounts: [accountWithMetrics],
              };

              const updatedGroups = currentGroups.map((group) => ({
                ...group,
                accounts: group.accounts.filter(
                  (acc: Account) =>
                    acc.id !== accountWithMetrics.id &&
                    acc.number !== accountWithMetrics.number
                ),
              }));

              setGroups([...updatedGroups, newGroup]);
            }
          } else {
            // Removing from group (groupId is null)
            setGroups(
              currentGroups.map((group) => ({
                ...group,
                accounts: group.accounts.filter(
                  (acc: Account) =>
                    acc.id !== accountWithMetrics.id &&
                    acc.number !== accountWithMetrics.number
                ),
              }))
            );
          }
        }
      } catch (error) {
        console.error("Error updating account:", error);
        throw error;
      }
    },
    [supabaseUser?.id, accounts, setAccounts, groups, setGroups, trades]
  );

  // Add createGroup function
  const saveGroup = useCallback(
    async (name: string) => {
      if (!supabaseUser?.id) return;
      try {
        const newGroup = await saveGroupAction(name);
        // Explicitly include accounts in the input if needed, though group action returns them.
        const normalizedNewGroup = normalizeGroupsForClient([newGroup as GroupInput])[0] as Group;
        setGroups([...groups, normalizedNewGroup]);
        return normalizedNewGroup;
      } catch (error) {
        console.error("Error creating group:", error);
        throw error;
      }
    },
    [supabaseUser?.id, groups, setGroups]
  );

  const renameGroup = useCallback(
    async (groupId: string, name: string) => {
      if (!supabaseUser?.id) return;
      try {
        setGroups(
          groups.map((group) =>
            group.id === groupId ? { ...group, name } : group
          )
        );
        await renameGroupAction(groupId, name);
      } catch (error) {
        console.error("Error renaming group:", error);
        throw error;
      }
    },
    [supabaseUser?.id, groups, setGroups]
  );

  // Add deleteGroup function
  const deleteGroup = useCallback(
    async (groupId: string) => {
      try {
        // Remove groupdId from accounts
        const updatedAccounts = accounts.map((account: Account) => {
          if (account.groupId === groupId) {
            return { ...account, groupId: null };
          }
          return account;
        });
        setAccounts(updatedAccounts);
        setGroups(groups.filter((group) => group.id !== groupId));
        await deleteGroupAction(groupId);
      } catch (error) {
        console.error("Error deleting group:", error);
        throw error;
      }
    },
    [accounts, setAccounts, groups, setGroups]
  );

  // Add moveAccountToGroup function
  const moveAccountToGroup = useCallback(
    async (accountId: string, targetGroupId: string | null) => {
      const { accounts: previousAccounts, groups: previousGroups } = useUserStore.getState();
      try {
        const { accounts: currentAccounts, groups: currentGroups } =
          useUserStore.getState();
        if (!currentAccounts || currentAccounts.length === 0) {
          console.error("No accounts available to move");
          return;
        }

        // Update accounts state using the freshest snapshot
        const updatedAccounts = currentAccounts.map((account: Account) => {
          if (account.id === accountId) {
            return { ...account, groupId: targetGroupId };
          }
          return account;
        });
        setAccounts(updatedAccounts);

        // Update groups state using the freshest snapshot
        const accountToMove = currentAccounts.find(
          (acc: Account) => acc.id === accountId
        );
        if (accountToMove) {
          // We have to ensure that the target group is created
          if (targetGroupId) {
            const targetGroup = currentGroups.find(
              (group) => group.id === targetGroupId
            );
            if (!targetGroup) {
              const newGroup = await saveGroup(targetGroupId);
              if (newGroup) {
                setGroups(
                  currentGroups.map((group) =>
                    group.id === targetGroupId
                      ? {
                        ...group,
                        accounts: [...group.accounts, accountToMove],
                      }
                      : group
                  )
                );
              }
            } else {
              setGroups(
                currentGroups.map((group) => {
                  // If this is the target group, add the account only if it's not already there
                  if (group.id === targetGroupId) {
                    const accountExists = group.accounts.some(
                      (acc: Account) => acc.id === accountId
                    );
                    return {
                      ...group,
                      accounts: accountExists
                        ? group.accounts
                        : [...group.accounts, accountToMove],
                    };
                  }
                  // For all other groups, remove the account if it exists
                  return {
                    ...group,
                    accounts: group.accounts.filter(
                      (acc: Account) => acc.id !== accountId
                    ),
                  };
                })
              );
            }
          }
        }

        await moveAccountToGroupAction(accountId, targetGroupId);
      } catch (error) {
        console.error("Error moving account to group, rolling back:", error);
        setAccounts(previousAccounts);
        setGroups(previousGroups);
        throw error;
      }
    },
    [setAccounts, setGroups, saveGroup]
  );

  const moveAccountsToGroup = useCallback(
    async (accountIds: string[], targetGroupId: string | null) => {
      const { accounts: previousAccounts, groups: previousGroups } = useUserStore.getState();
      try {
        const { accounts: currentAccounts, groups: currentGroups } =
          useUserStore.getState();
        if (
          !currentAccounts ||
          currentAccounts.length === 0 ||
          accountIds.length === 0
        )
          return;

        const idSet = new Set(accountIds);
        const accountsToMove = currentAccounts.filter((acc: Account) =>
          idSet.has(acc.id)
        );

        // Update accounts state using the freshest snapshot
        const updatedAccounts = currentAccounts.map((account: Account) =>
          idSet.has(account.id)
            ? { ...account, groupId: targetGroupId }
            : account
        );
        setAccounts(updatedAccounts);

        // Update groups state using the freshest snapshot
        setGroups(
          currentGroups.map((group) => {
            const remainingAccounts = group.accounts.filter(
              (acc: Account) => !idSet.has(acc.id)
            );
            if (group.id === targetGroupId) {
              const missingToAdd = accountsToMove.filter(
                (acc) =>
                  !remainingAccounts.some((existing) => existing.id === acc.id)
              );
              return {
                ...group,
                accounts: [...remainingAccounts, ...missingToAdd],
              };
            }
            return { ...group, accounts: remainingAccounts };
          })
        );

        await Promise.all(
          accountIds.map((id) => moveAccountToGroupAction(id, targetGroupId))
        );
      } catch (error) {
        console.error("Error moving accounts to group, rolling back:", error);
        setAccounts(previousAccounts);
        setGroups(previousGroups);
        throw error;
      }
    },
    [setAccounts, setGroups]
  );

  // Add savePayout function
  const savePayout = useCallback(
    async (payout: PrismaPayout | AccountPayout) => {
      if (!supabaseUser?.id || isSharedView) return;

      // Capture state for rollback
      const previousAccounts = [...accounts];

      try {
        const normalizedPayout = normalizePayoutForClient(payout as any);

        // Update the account with the new/updated payout immediately
        const updatedAccounts = accounts.map((account: Account) => {
          if (account.number === payout.accountNumber) {
            const existingPayouts = account.payouts || [];
            const isUpdate =
              payout.id && existingPayouts.some((p) => p.id === payout.id);

            if (isUpdate) {
              return {
                ...account,
                payouts: existingPayouts.map((p) =>
                  p.id === payout.id ? normalizedPayout : p
                ),
              };
            } else {
              return {
                ...account,
                payouts: [...existingPayouts, normalizedPayout],
              };
            }
          }
          return account;
        });

        // Recalculate metrics for the affected account (optimistic, client-side)
        const affectedAccount = updatedAccounts.find(
          (acc) => acc.number === payout.accountNumber
        );

        if (affectedAccount) {
          const accountsWithMetrics = computeMetricsForAccounts(
            [affectedAccount],
            trades
          );
          const accountWithMetrics = normalizeAccountForClient(accountsWithMetrics[0]);
          setAccounts(
            updatedAccounts.map((acc) =>
              acc.number === payout.accountNumber ? accountWithMetrics : acc
            )
          );
        } else {
          setAccounts(updatedAccounts);
        }

        // Perform server action in background
        await savePayoutAction(payout as any);
      } catch (error) {
        console.error("Error saving payout, rolling back:", error);
        setAccounts(previousAccounts);
        throw error;
      }
    },
    [supabaseUser?.id, isSharedView, accounts, setAccounts, trades]
  );

  // Add deleteAccount function
  const deleteAccount = useCallback(
    async (account: Account) => {
      if (!supabaseUser?.id || isSharedView) return;

      const previousAccounts = [...accounts];
      try {
        // Update local state immediately
        setAccounts(accounts.filter((acc: Account) => acc.id !== account.id));
        // Delete from database
        await deleteAccountAction(account);
      } catch (error) {
        console.error("Error deleting account, rolling back:", error);
        setAccounts(previousAccounts);
        throw error;
      }
    },
    [supabaseUser?.id, isSharedView, accounts, setAccounts]
  );

  // Add deletePayout function
  const deletePayout = useCallback(
    async (payoutId: string) => {
      if (!supabaseUser?.id || isSharedView) return;

      try {
        // Find the account that has this payout
        const affectedAccount = accounts.find((account: Account) =>
          account.payouts?.some((p) => p.id === payoutId)
        );

        // Update accounts with removed payout
        const updatedAccounts = accounts.map((account: Account) => ({
          ...account,
          payouts: account.payouts?.filter((p) => p.id !== payoutId) || [],
        }));

        // Delete from database
        await deletePayoutAction(payoutId);

        // Recalculate metrics for the affected account (optimistic, client-side)
        if (affectedAccount) {
          const accountToRecalculate = updatedAccounts.find(
            (acc) => acc.id === affectedAccount.id
          );
          if (accountToRecalculate) {
            const accountsWithMetrics = computeMetricsForAccounts(
              [accountToRecalculate],
              trades
            );
            const accountWithMetrics = normalizeAccountForClient(accountsWithMetrics[0]);

            // Update accounts with recalculated metrics
            setAccounts(
              updatedAccounts.map((acc) =>
                acc.id === affectedAccount.id ? accountWithMetrics : acc
              )
            );
          } else {
            setAccounts(updatedAccounts);
          }
        } else {
          setAccounts(updatedAccounts);
        }
      } catch (error) {
        console.error("Error deleting payout:", error);
        throw error;
      }
    },
    [supabaseUser?.id, isSharedView, accounts, setAccounts, trades]
  );

  const changeIsFirstConnection = useCallback(
    async (isFirstConnection: boolean) => {
      if (!supabaseUser?.id) return;
      // Update the user in the database
      setIsFirstConnection(isFirstConnection);
      await updateIsFirstConnectionAction(isFirstConnection);
    },
    [supabaseUser?.id, setIsFirstConnection]
  );

  const updateTrades = useCallback(
    async (tradeIds: string[], update: Partial<Trade>) => {
      if (!supabaseUser?.id) return;
      if (tradeIds.length === 0) return;

      const previousTrades = [...trades];

      try {
        const updatedTrades = trades.map((trade: Trade) =>
          tradeIds.includes(trade.id)
            ? {
              ...trade,
              ...update,
            }
            : trade
        );
        setTrades(updatedTrades);
        // Cast to any to bypass strict Decimal vs Number mismatch in server action signature
        const updatedCount = await updateTradesAction(tradeIds, update as any);
        if (updatedCount === 0 || updatedCount !== tradeIds.length) {
          throw new Error(
            `Failed to persist trade updates (updated ${updatedCount}/${tradeIds.length})`,
          );
        }
      } catch (error) {
        console.error("Error updating trades, rolling back:", error);
        setTrades(previousTrades);
        throw error;
      }
    },
    [supabaseUser?.id, trades, setTrades]
  );

  const groupTrades = useCallback(
    async (tradeIds: string[]) => {
      if (!supabaseUser?.id) return;
      const previousTrades = [...trades];
      try {
        const targetGroupId = tradeIds[0];
        setTrades(
          trades.map((trade: Trade) =>
            tradeIds.includes(trade.id) ? { ...trade, groupId: targetGroupId } : trade
          )
        );
        await groupTradesAction(tradeIds);
      } catch (error) {
        console.error("Error grouping trades, rolling back:", error);
        setTrades(previousTrades);
        throw error;
      }
    },
    [supabaseUser?.id, trades, setTrades]
  );

  const ungroupTrades = useCallback(
    async (tradeIds: string[]) => {
      if (!supabaseUser?.id) return;
      const previousTrades = [...trades];
      try {
        setTrades(
          trades.map((trade: Trade) =>
            tradeIds.includes(trade.id) ? { ...trade, groupId: null } : trade
          )
        );
        await ungroupTradesAction(tradeIds);
      } catch (error) {
        console.error("Error ungrouping trades, rolling back:", error);
        setTrades(previousTrades);
        throw error;
      }
    },
    [supabaseUser?.id, trades, setTrades]
  );

  const deleteTrades = useCallback(
    async (tradeIds: string[]) => {
      if (!supabaseUser?.id) return;

      // Optimistically remove trades from local state immediately
      // Use startTransition to mark the expensive recalculation as non-urgent
      // This keeps the UI responsive while formattedTrades recalculates
      const remainingTrades = trades.filter(
        (trade) => !tradeIds.includes(trade.id)
      );

      // Update state in a transition so it doesn't block the UI
      setTrades(remainingTrades);

      try {
        // Delete from database
        await deleteTradesByIdsAction(tradeIds);
      } catch (error) {
        // On error, refresh to restore the correct state
        console.error("Error deleting trades:", error);
        await refreshAllData();
        throw error;
      }
    },
    [supabaseUser?.id, trades, setTrades, refreshAllData]
  );

  const getTradeImages = useCallback(
    async (tradeId: string) => {
      if (!supabaseUser?.id) return null;
      try {
        return await getTradeImagesAction(tradeId);
      } catch (error) {
        console.error("Error fetching trade images:", error);
        return null;
      }
    },
    [supabaseUser?.id]
  );

  const saveDashboardLayout = useCallback(
    async (layout: PrismaDashboardLayout) => {
      if (!supabaseUser?.id) return;

      try {
        setDashboardLayout(layout as unknown as DashboardLayoutWithWidgets);
        await saveDashboardLayoutAction(layout);
      } catch (error: unknown) {
        console.error("DashboardActions] Error saving dashboard layout:", error);
        throw error;
      }
    },
    [supabaseUser?.id, setDashboardLayout]
  );

  const dataStateValue = useMemo<DashboardDataState>(
    () => ({
      isLoading,
      isMobile,
      isSharedView,
      sharedParams,
      setSharedParams,
      isFirstConnection,
      setIsFirstConnection,
      trades,
      accounts,
    }),
    [
      isLoading,
      isMobile,
      isSharedView,
      sharedParams,
      setSharedParams,
      isFirstConnection,
      setIsFirstConnection,
      trades,
      accounts,
    ]
  );

  const filtersValue = useMemo<DashboardFiltersState>(
    () => ({
      instruments,
      setInstruments,
      accountNumbers,
      setAccountNumbers,
      dateRange,
      setDateRange,
      tickRange,
      setTickRange,
      pnlRange,
      setPnlRange,
      timeRange,
      setTimeRange,
      tickFilter,
      setTickFilter,
      weekdayFilter,
      setWeekdayFilter,
      hourFilter,
      setHourFilter,
      tagFilter,
      setTagFilter,
    }),
    [
      instruments,
      setInstruments,
      accountNumbers,
      setAccountNumbers,
      dateRange,
      setDateRange,
      tickRange,
      setTickRange,
      pnlRange,
      setPnlRange,
      timeRange,
      setTimeRange,
      tickFilter,
      setTickFilter,
      weekdayFilter,
      setWeekdayFilter,
      hourFilter,
      setHourFilter,
      tagFilter,
      setTagFilter,
    ]
  );

  const derivedValue = useMemo<DashboardDerivedState>(
    () => ({
      formattedTrades,
      statistics,
      calendarData,
    }),
    [formattedTrades, statistics, calendarData]
  );

  const actionsValue = useMemo<DashboardActions>(
    () => ({
      isPlusUser,
      refreshTrades: refreshAllData,
      refreshTradesOnly,
      refreshUserDataOnly,
      refreshAllData,
      changeIsFirstConnection,
      updateTrades,
      deleteTrades,
      groupTrades,
      ungroupTrades,
      getTradeImages,
      deleteAccount,
      saveAccount,
      saveGroup,
      renameGroup,
      deleteGroup,
      moveAccountToGroup,
      moveAccountsToGroup,
      savePayout,
      deletePayout,
      saveDashboardLayout,
    }),
    [
      isPlusUser,
      refreshAllData,
      refreshTradesOnly,
      refreshUserDataOnly,
      changeIsFirstConnection,
      updateTrades,
      deleteTrades,
      groupTrades,
      ungroupTrades,
      getTradeImages,
      deleteAccount,
      saveAccount,
      saveGroup,
      renameGroup,
      deleteGroup,
      moveAccountToGroup,
      moveAccountsToGroup,
      savePayout,
      deletePayout,
      saveDashboardLayout,
    ]
  );

  const contextValue = useMemo<DataContextType>(
    () => ({
      ...dataStateValue,
      ...filtersValue,
      ...derivedValue,
      ...actionsValue,
    }),
    [dataStateValue, filtersValue, derivedValue, actionsValue]
  );

  return (
    <DashboardDataStateContext.Provider value={dataStateValue}>
      <DashboardFiltersContext.Provider value={filtersValue}>
        <DashboardDerivedContext.Provider value={derivedValue}>
          <DashboardActionsContext.Provider value={actionsValue}>
            <DataContext.Provider value={contextValue}>
              {children}
            </DataContext.Provider>
          </DashboardActionsContext.Provider>
        </DashboardDerivedContext.Provider>
      </DashboardFiltersContext.Provider>
    </DashboardDataStateContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const useDashboardTrades = () => {
  const context = useContext(DashboardDataStateContext);
  if (!context) {
    throw new Error("useDashboardTrades must be used within a DataProvider");
  }
  return context;
};

export const useDashboardFilters = () => {
  const context = useContext(DashboardFiltersContext);
  if (!context) {
    throw new Error("useDashboardFilters must be used within a DataProvider");
  }
  return context;
};

export const useDashboardStats = () => {
  const context = useContext(DashboardDerivedContext);
  if (!context) {
    throw new Error("useDashboardStats must be used within a DataProvider");
  }
  return context;
};

export const useDashboardActions = () => {
  const context = useContext(DashboardActionsContext);
  if (!context) {
    throw new Error("useDashboardActions must be used within a DataProvider");
  }
  return context;
};

// Add getTimeRangeKey function at the top level
function getTimeRangeKey(timeInPosition: number): string {
  const minutes = timeInPosition / 60; // Convert seconds to minutes
  if (minutes < 1) return "under1min";
  if (minutes >= 1 && minutes < 5) return "1to5min";
  if (minutes >= 5 && minutes < 10) return "5to10min";
  if (minutes >= 10 && minutes < 15) return "10to15min";
  if (minutes >= 15 && minutes < 30) return "15to30min";
  if (minutes >= 30 && minutes < 60) return "30to60min";
  if (minutes >= 60 && minutes < 120) return "1to2hours";
  if (minutes >= 120 && minutes < 300) return "2to5hours";
  return "over5hours";
}
