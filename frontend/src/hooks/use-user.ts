"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { User } from "@/types/user";
import type { UserResponse } from "@/types/api";

export function useUser() {
  return useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      const { data } = await apiClient.get<UserResponse>("/auth/me");
      return data.user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
