"use client";

import { useQuery } from "@tanstack/react-query";
import type { Account } from "@/prisma/generated/prisma";

async function fetchAccounts(): Promise<Account[]> {
  const response = await fetch("/api/dashboard/accounts");
  if (!response.ok) {
    throw new Error("Failed to fetch accounts");
  }
  return response.json();
}

export function useAccountsQuery() {
  return useQuery({
    queryKey: ["dashboard", "accounts"],
    queryFn: fetchAccounts,
  });
}
