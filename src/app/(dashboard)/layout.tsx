import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { UserCard } from "@/components/layout/UserCard";

export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <DashboardShell userCard={<UserCard />}>
      {children}
    </DashboardShell>
  );
}
