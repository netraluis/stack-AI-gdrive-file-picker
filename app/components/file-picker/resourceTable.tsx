import { useState } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { ArrowUpDown } from "lucide-react"
import { Resource } from "@/app/lib/connectionsApi"
import { ResourceChildrenMap, ResourceState } from "@/app/types/resourcesTypes"
import { TableSkeleton } from "./tableSkeleton"
import { ResourceItem } from "./resourceItem"


interface ResourceTableProps {
  resources: Resource[]
  isLoading: boolean
  expandedFolders: string[]
  setExpandedFolders: React.Dispatch<React.SetStateAction<string[]>>
  selectedResources: string[]
  setSelectedResources: React.Dispatch<React.SetStateAction<string[]>>
  onRemoveResource: (resource: Resource) => void
  childResourcesMap: ResourceChildrenMap
  setChildResourcesMap: React.Dispatch<React.SetStateAction<ResourceChildrenMap>>
  showDateColumn: boolean
  connectionId: string
  authToken: string
  indexingStatus: Record<string, ResourceState>
  setIndexingStatus: React.Dispatch<React.SetStateAction<Record<string, ResourceState>>>
  searchTerm: string
  onToggleSelection: (resourceId: string, isFolder: boolean) => void
}

/**
 * Table component for displaying resources with sorting and filtering
 */
export function ResourceTable({
  resources,
  isLoading,
  expandedFolders,
  setExpandedFolders,
  selectedResources,
  setSelectedResources,
  onRemoveResource,
  childResourcesMap,
  setChildResourcesMap,
  showDateColumn,
  connectionId,
  authToken,
  indexingStatus,
  setIndexingStatus,
  searchTerm,
  onToggleSelection,
}: ResourceTableProps) {
  const [sortField, setSortField] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Filter resources by search term
  const filteredResources = resources.filter((resource) => {
    const path = resource.inode_path.path.toLowerCase()
    return path.includes(searchTerm.toLowerCase())
  })

  // Sort resources
  const sortedResources = [...filteredResources].sort((a, b) => {
    // First sort by type (directories first)
    if (a.inode_type !== b.inode_type) {
      return a.inode_type === "directory" ? -1 : 1
    }

    // Then sort by the selected field
    let valA, valB
    if (sortField === "name") {
      const pathA = a.inode_path.path.split("/").filter(Boolean).pop() || ""
      const pathB = b.inode_path.path.split("/").filter(Boolean).pop() || ""
      valA = pathA.toLowerCase()
      valB = pathB.toLowerCase()
    } else if (sortField === "status") {
      valA = a.status || ""
      valB = b.status || ""
    } else {
      // Default sorting
      valA = a.resource_id
      valB = b.resource_id
    }

    const comparison = valA > valB ? 1 : -1
    return sortDirection === "asc" ? comparison : -comparison
  })

  return (
    <div className="border rounded-md overflow-hidden flex flex-col">
      <div style={{ maxHeight: "calc(100vh - 250px)", overflowY: "auto" }}>
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-[50px]">{/* Checkbox header */}</TableHead>
              <TableHead className="w-[50px]">Type</TableHead>
              <TableHead className="w-[250px] cursor-pointer" onClick={() => handleSort("name")}>
                <div className="flex items-center">
                  Name
                  {sortField === "name" && <ArrowUpDown className="ml-1 h-4 w-4" />}
                </div>
              </TableHead>
              {showDateColumn && <TableHead className="w-[150px]">Resource ID</TableHead>}
              <TableHead className="w-[120px] cursor-pointer" onClick={() => handleSort("status")}>
                <div className="flex items-center">
                  Status
                  {sortField === "status" && <ArrowUpDown className="ml-1 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton rows={5} showDateColumn={showDateColumn} />
            ) : sortedResources.length > 0 ? (
              // Root resources with hierarchical children
              sortedResources.map((resource) => (
                <ResourceItem
                  key={resource.resource_id}
                  resource={resource}
                  depth={0}
                  expandedFolders={expandedFolders}
                  setExpandedFolders={setExpandedFolders}
                  selectedResources={selectedResources}
                  setSelectedResources={setSelectedResources}
                  onRemoveResource={onRemoveResource}
                  childResourcesMap={childResourcesMap}
                  setChildResourcesMap={setChildResourcesMap}
                  showDateColumn={showDateColumn}
                  connectionId={connectionId}
                  authToken={authToken}
                  indexingStatus={indexingStatus}
                  setIndexingStatus={setIndexingStatus}
                  onToggleSelection={onToggleSelection}
                />
              ))
            ) : (
              // Empty state
              <TableRow>
                <TableCell colSpan={showDateColumn ? 6 : 5} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No matching files or folders found." : "No files or folders available."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}