"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ContributionDay } from "@/types/contribution";
import type { ContributionsResponse, SyncResult } from "@/types/api";

export function useContributions(days: number = 30) {
  return useQuery<ContributionDay[]>({
    queryKey: ["contributions", days],
    queryFn: async () => {
      const { data } = await apiClient.get<ContributionsResponse>(
        `/contributions?days=${days}`
      );
      return data.contributions;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSyncContributions() {
  const queryClient = useQueryClient();
  return useMutation<SyncResult, Error, number>({
    mutationFn: async (days: number = 30) => {
      const { data } = await apiClient.post<SyncResult>(
        `/contributions/sync?days=${days}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
    },
  });
}
