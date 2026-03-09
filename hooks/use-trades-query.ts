"use client";

import { useQuery } from "@tanstack/react-query";
import type { PaginatedTrades } from "@/server/database";

async function fetchTrades(page: number, pageSize: number): Promise<PaginatedTrades> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  const response = await fetch(`/api/dashboard/trades?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch trades");
  }
  return response.json();
}

export function useTradesQuery(page = 1, pageSize = 50) {
  return useQuery({
    queryKey: ["dashboard", "trades", page, pageSize],
    queryFn: () => fetchTrades(page, pageSize),
  });
}
