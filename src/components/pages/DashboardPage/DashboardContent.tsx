import React from "react";
import { StatusCard } from "@/components/StatusCard";
import { ProductsCountCard } from "@/components/ProductsCountCard";
import { RecentJobsTable } from "@/components/RecentJobsTable";
import { STYLES } from "./constants";
import type { DashboardData } from "./types";

interface DashboardContentProps {
  data: DashboardData;
  hasShop: boolean;
}

export function DashboardContent({ data, hasShop }: DashboardContentProps) {
  return (
    <>
      {/* Grid with cards */}
      <section className={STYLES.GRID}>
        <StatusCard status={hasShop} shopName={data.shop.shopifyDomain || undefined} />
        <ProductsCountCard count={data.count} />
      </section>

      {/* Recent jobs table */}
      <section>
        <RecentJobsTable jobs={data.jobs} />
      </section>
    </>
  );
}
