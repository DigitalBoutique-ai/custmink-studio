import type { Metadata } from "next";

import { DashboardView } from "@/components/techpack/dashboard-view";

export const metadata: Metadata = { title: "Dashboard | Custm.ink Studio" };

export default function DashboardPage() {
  return <DashboardView />;
}
