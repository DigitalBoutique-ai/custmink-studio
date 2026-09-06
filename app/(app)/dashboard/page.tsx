import type { Metadata } from "next";

import { DashboardView } from "@/components/techpack/dashboard-view";
import { pageTitle } from "@/lib/brand";

export const metadata: Metadata = { title: pageTitle("Dashboard") };

export default function DashboardPage() {
  return <DashboardView />;
}
