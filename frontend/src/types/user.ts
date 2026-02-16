export interface User {
  id: string;
  github_id: string;
  username: string;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  /** GitHub account creation date (when user joined GitHub). Present after next login. */
  github_created_at?: string | null;
}
