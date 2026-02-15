"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Repo } from "@/types/repo";
import type { ReposResponse, RepoResponse, SyncResult } from "@/types/api";

export function useRepos() {
  return useQuery<Repo[]>({
    queryKey: ["repos"],
    queryFn: async () => {
      const { data } = await apiClient.get<ReposResponse>("/repos");
      return data.repos;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useRepo(id: string) {
  return useQuery<Repo>({
    queryKey: ["repos", id],
    queryFn: async () => {
      const { data } = await apiClient.get<RepoResponse>(`/repos/${id}`);
      return data.repo;
    },
    enabled: !!id,
  });
}

export function useSyncRepos() {
  const queryClient = useQueryClient();
  return useMutation<SyncResult>({
    mutationFn: async () => {
      const { data } = await apiClient.post<SyncResult>("/repos/sync");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repos"] });
    },
  });
}
