import { FolderGit2 } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { SyncButton } from "@/components/dashboard/sync-button";

interface RepoEmptyStateProps {
  onSync: () => void;
  isSyncing: boolean;
}

export function RepoEmptyState({ onSync, isSyncing }: RepoEmptyStateProps) {
  return (
    <EmptyState
      icon={FolderGit2}
      title="No repositories yet"
      description="Sync your GitHub repositories to see them here."
    >
      <SyncButton onClick={onSync} isPending={isSyncing} />
    </EmptyState>
  );
}
