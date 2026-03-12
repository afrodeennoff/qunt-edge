import { getTradesAction, type SerializedTrade } from "@/server/database";
import { getUserId } from "@/server/auth";
import { getRedisJson, setRedisJson } from "@/lib/redis-cache";

const DEFAULT_PAGE_SIZE = 500;
const MAX_PAGES = 200;

type GetAllTradesOptions = {
  pageSize?: number;
  maxPages?: number;
  forceRefresh?: boolean;
};

export type AiTradesFetchResult = {
  trades: SerializedTrade[];
  truncated: boolean;
  fetchedPages: number;
  dataQualityWarning?: string;
};

/**
 * AI analytics tools need complete user trade history; getTradesAction is paginated.
 * This helper fetches all pages with conservative guards.
 */
export async function getAllTradesForAi(
  options: GetAllTradesOptions = {},
): Promise<AiTradesFetchResult> {
  const pageSize = Math.max(1, Math.floor(options.pageSize ?? DEFAULT_PAGE_SIZE));
  const maxPages = Math.max(1, Math.floor(options.maxPages ?? MAX_PAGES));
  const forceRefresh = options.forceRefresh ?? false;
  const userId = await getUserId();
  const cacheKey = `user:${userId}:ps:${pageSize}:mp:${maxPages}`;

  if (!forceRefresh) {
    const cached = await getRedisJson<AiTradesFetchResult>("ai-trades", cacheKey);
    if (cached) {
      return cached;
    }
  }

  const allTrades: SerializedTrade[] = [];
  let page = 1;
  let truncated = false;

  while (page <= maxPages) {
    const paginated = await getTradesAction(
      userId,
      page,
      pageSize,
      forceRefresh && page === 1,
      false,
    );
    allTrades.push(...paginated.trades);

    if (!paginated.metadata.hasMore) {
      break;
    }

    if (page === maxPages) {
      truncated = true;
      break;
    }

    page += 1;
  }

  const result: AiTradesFetchResult = {
    trades: allTrades,
    truncated,
    fetchedPages: page,
    dataQualityWarning: truncated
      ? "Analysis is based on a capped subset of trade history. Results may be incomplete."
      : undefined,
  };

  await setRedisJson("ai-trades", cacheKey, result, 90);
  return result;
}
