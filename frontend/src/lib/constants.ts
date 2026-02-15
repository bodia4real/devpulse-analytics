export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export const ROUTES = {
  home: "/",
  callback: "/callback",
  dashboard: "/dashboard",
  repos: "/repos",
  contributions: "/contributions",
  profile: "/profile",
} as const;

export const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  Ruby: "#701516",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Scala: "#c22d40",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
  Lua: "#000080",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  R: "#198CE7",
  Zig: "#ec915c",
  Nix: "#7e7eff",
  Dockerfile: "#384d54",
};

export const DEFAULT_CONTRIBUTION_DAYS = 30;
