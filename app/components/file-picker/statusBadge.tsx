import { ResourceState } from "@/app/types/resourcesTypes"
import { Badge } from "@/components/ui/badge"


interface StatusBadgeProps {
  status?: ResourceState | string
  resourceId: string
  indexingStatus: Record<string, ResourceState>
}

/**
 * Renders a badge displaying the current status of a resource
 */
export function StatusBadge({ status, resourceId, indexingStatus }: StatusBadgeProps) {
  // First check processing status
  if (indexingStatus[resourceId]) {
    const currentStatus = indexingStatus[resourceId] as ResourceState

    const statusClasses: Record<ResourceState, string> = {
      [ResourceState.INDEXING]: "bg-sky-200 hover:bg-sky-300 text-sky-800",
      [ResourceState.REMOVING]: "bg-rose-200 hover:bg-rose-300 text-rose-800",
      [ResourceState.INDEXED]: "bg-emerald-200 hover:bg-emerald-300 text-emerald-800",
      [ResourceState.FAILED]: "bg-rose-300 hover:bg-rose-400 text-rose-900",
      [ResourceState.SYNCHRONIZED]: "bg-lime-200 hover:bg-lime-300 text-lime-800",
      [ResourceState.SYNCRONIZING]: "bg-amber-200 hover:bg-amber-300 text-amber-800",
      [ResourceState.RESOURCE]: "bg-zinc-200 hover:bg-zinc-300 text-zinc-800",
    }

    return (
      <Badge variant="default" className={statusClasses[currentStatus]}>
        {currentStatus === ResourceState.INDEXING
          ? "indexing..."
          : currentStatus === ResourceState.REMOVING
            ? "removing..."
            : currentStatus}
      </Badge>
    )
  }

  return (
    status && (
      <Badge variant="default" className="bg-gray-500 hover:bg-gray-600 text-white">
        {status}
      </Badge>
    )
  )
}