import { useState, useEffect } from "react";
import type { ShopResponseDTO, JobListDTO } from "@/types";

interface DashboardData {
  shop: ShopResponseDTO;
  count: number;
  jobs: JobListDTO[];
}

interface UseDashboardDataReturn {
  data?: DashboardData;
  loading: boolean;
  error?: Error;
  refetch: () => void;
}

export function useDashboardData(): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardData>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(undefined);

    try {
      // Fetch shop data
      const shopResponse = await fetch("/api/shops");
      if (!shopResponse.ok) {
        throw new Error(`Failed to fetch shop: ${shopResponse.statusText}`);
      }
      const shop: ShopResponseDTO = await shopResponse.json();

      // Fetch products count (limit=1 to get meta with minimal data)
      const productsResponse = await fetch("/api/products?page=1&limit=1");
      if (!productsResponse.ok) {
        throw new Error(`Failed to fetch products: ${productsResponse.statusText}`);
      }
      const productsData = await productsResponse.json();
      const count = productsData.meta?.total || 0;

      // Fetch recent 5 jobs
      const jobsResponse = await fetch("/api/jobs?limit=5");
      if (!jobsResponse.ok) {
        throw new Error(`Failed to fetch jobs: ${jobsResponse.statusText}`);
      }
      const jobsData = await jobsResponse.json();
      const jobs: JobListDTO[] = jobsData.data || [];

      setData({ shop, count, jobs });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData,
  };
}
