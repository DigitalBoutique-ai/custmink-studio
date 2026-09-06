import type { Metadata } from "next";

import { DashboardView } from "@/components/techpack/dashboard-view";
import { requireSession } from "@/lib/auth/session";
import { pageTitle } from "@/lib/brand";

export const metadata: Metadata = { title: pageTitle("Dashboard") };

export default async function DashboardPage() {
  const session = await requireSession();
  return <DashboardView firstName={session.name.split(" ")[0] ?? session.name} />;
}
