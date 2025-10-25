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

      // Handle authentication errors (401) - these are real errors
      if (shopResponse.status === 401) {
        throw new Error("Unauthorized - Please log in");
      }

      // Handle server errors (500+) - these are real errors
      if (shopResponse.status >= 500) {
        throw new Error(`Server error: ${shopResponse.statusText}`);
      }

      // Parse shop data - now always returns 200 OK with isConnected flag
      const shop: ShopResponseDTO = await shopResponse.json();

      // Fetch products count (limit=1 to get meta with minimal data)
      // Only fetch if shop is connected
      let count = 0;
      let jobs: JobListDTO[] = [];

      if (shop.isConnected) {
        const productsResponse = await fetch("/api/products?page=1&limit=1");
        if (!productsResponse.ok) {
          throw new Error(`Failed to fetch products: ${productsResponse.statusText}`);
        }
        const productsData = await productsResponse.json();
        count = productsData.meta?.total || 0;

        // Fetch recent 5 jobs
        const jobsResponse = await fetch("/api/jobs?limit=5");
        if (!jobsResponse.ok) {
          throw new Error(`Failed to fetch jobs: ${jobsResponse.statusText}`);
        }
        const jobsData = await jobsResponse.json();
        jobs = jobsData.data || [];
      }

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
