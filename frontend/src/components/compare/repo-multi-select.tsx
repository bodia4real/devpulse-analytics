"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";
import type { Repo } from "@/types/repo";

interface RepoMultiSelectProps {
  repos: Repo[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  max?: number;
}

export function RepoMultiSelect({
  repos,
  selectedIds,
  onChange,
  max = 3,
}: RepoMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = repos.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else if (selectedIds.length < max) {
      onChange([...selectedIds, id]);
    }
  };

  const selectedNames = repos
    .filter((r) => selectedIds.includes(r.id))
    .map((r) => r.name);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-left font-normal"
        >
          <span className="truncate">
            {selectedNames.length > 0
              ? selectedNames.join(", ")
              : "Select repositories..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <Input
            placeholder="Search repos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="p-2 text-center text-sm text-muted-foreground">
              No repos found
            </p>
          ) : (
            filtered.map((repo) => {
              const checked = selectedIds.includes(repo.id);
              const disabled = !checked && selectedIds.length >= max;
              return (
                <label
                  key={repo.id}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent/50 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => !disabled && toggle(repo.id)}
                    disabled={disabled}
                  />
                  <span className="truncate">{repo.name}</span>
                  {repo.language && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {repo.language}
                    </span>
                  )}
                </label>
              );
            })
          )}
        </div>
        {selectedIds.length >= max && (
          <p className="border-t p-2 text-center text-xs text-muted-foreground">
            Maximum {max} repos selected
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
