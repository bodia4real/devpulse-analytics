import type { User } from "./user";
import type { Repo } from "./repo";
import type { ContributionDay } from "./contribution";

export interface ApiError {
  success: false;
  error: string;
}

export interface SyncResult {
  synced: number;
  inserted: number;
  updated: number;
}

export interface UserResponse {
  user: User;
}

export interface ReposResponse {
  repos: Repo[];
}

export interface RepoResponse {
  repo: Repo;
}

export interface ContributionsResponse {
  contributions: ContributionDay[];
}
