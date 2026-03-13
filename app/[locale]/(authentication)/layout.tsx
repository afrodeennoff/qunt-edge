import type { Metadata } from "next";
import AuthenticationClientLayout from "./client-layout";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthenticationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticationClientLayout>{children}</AuthenticationClientLayout>;
}
