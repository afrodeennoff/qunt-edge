"use client";

import { AuthTimeout } from "@/components/auth/auth-timeout";
import { QueryProvider } from "@/components/providers/query-provider";

export function ProtectedRouteProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <AuthTimeout />
      {children}
    </QueryProvider>
  );
}
