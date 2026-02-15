"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface RepoFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  language: string;
  onLanguageChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  languages: string[];
}

export function RepoFilters({
  search,
  onSearchChange,
  language,
  onLanguageChange,
  sortBy,
  onSortChange,
  languages,
}: RepoFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search repositories..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={language} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Languages</SelectItem>
          {languages.map((lang) => (
            <SelectItem key={lang} value={lang}>
              {lang}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="updated">Recently Updated</SelectItem>
          <SelectItem value="stars">Most Stars</SelectItem>
          <SelectItem value="forks">Most Forks</SelectItem>
          <SelectItem value="name">Name</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
