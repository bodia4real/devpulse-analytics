export interface Repo {
  id: string;
  github_repo_id: string;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  open_issues: number;
  watchers: number;
  created_at: string;
  updated_at: string;
}
