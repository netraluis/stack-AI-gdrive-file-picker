import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Plus, Search } from "lucide-react"
import { useState, useCallback } from "react"

interface ActionBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onIndexSelected: () => void
  onSync: () => void
  onNewKB: () => void
  selectedCount: number
  kbExists: boolean
  isSyncing: boolean
  hasSynced: boolean
}

/**
 * Component for search and action buttons
 */
export function ActionBar({
  searchTerm,
  onSearchChange,
  onIndexSelected,
  onSync,
  onNewKB,
  selectedCount,
  kbExists,
  isSyncing,
  hasSynced,
}: ActionBarProps) {
  
  // Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value)
  }, [onSearchChange])
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="relative w-full sm:w-auto sm:flex-grow max-w-md">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search files and folders..."
            className="pl-8 w-full"
          />
        </div>
      </div>

      <div className="flex space-x-2 w-full sm:w-auto">
        {kbExists ? (
          <>
            {!hasSynced && (
              <Button
                onClick={onSync}
                variant="default"
                disabled={isSyncing || selectedCount === 0}
                className="flex items-center gap-1 w-full sm:w-auto"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Syncing..." : "Sync"}
              </Button>
            )}
            <Button
              onClick={onNewKB}
              variant="outline"
              className="flex items-center gap-1 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              New KB
            </Button>
          </>
        ) : (
          <Button
            onClick={onIndexSelected}
            variant="default"
            disabled={selectedCount === 0}
            className="flex items-center gap-1 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Index Selected ({selectedCount})
          </Button>
        )}
      </div>
    </div>
  )
}