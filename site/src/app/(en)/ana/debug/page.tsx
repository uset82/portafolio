import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AnaDebugDashboard } from "@/components/ana-debug-dashboard";
import { getAnaDebugStore, isAnaDebugEnabled } from "@/ana/debug";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ANA debug",
  description: "Internal ANA observability. Not a public visitor feature.",
  robots: { index: false, follow: false },
};

export default function AnaDebugPage() {
  if (!isAnaDebugEnabled()) notFound();
  return <AnaDebugDashboard snapshots={getAnaDebugStore().list()} />;
}
