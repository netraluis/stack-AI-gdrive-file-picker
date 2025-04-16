import { useState, useEffect } from "react"
import { TableRow, TableCell } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Folder, File, ChevronRight, ChevronDown, Trash2, RefreshCw, FolderOpen } from "lucide-react"
import { Resource } from "@/app/lib/connectionsApi"
import { ResourceChildrenMap, ResourceState } from "@/app/types/resourcesTypes"
import { StatusBadge } from "./statusBadge"
import { useResources } from "@/app/hooks/useResources"


interface ResourceItemProps {
  resource: Resource
  depth?: number
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
  onToggleSelection: (resourceId: string, isFolder: boolean) => void
}

/**
 * Component for rendering a single resource item (file or folder)
 * with support for nested resources
 */
export function ResourceItem({
  resource,
  depth = 0,
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
  onToggleSelection,
}: ResourceItemProps) {
  const resourceId = resource.resource_id
  const isFolder = resource.inode_type === "directory"
  const isExpanded = expandedFolders.includes(resourceId)
  const isSelected = selectedResources.includes(resourceId)
  const fileName = resource.inode_path.path.split("/").filter(Boolean).pop() || ""
  const isProcessing = indexingStatus[resourceId] === ResourceState.INDEXING || 
                       indexingStatus[resourceId] === ResourceState.REMOVING
  const [getData, setGetData] = useState(false)

  // Use custom hook to fetch resources
  const { resources, isLoading } = useResources(
    getData ? connectionId : null, 
    authToken, 
    resourceId
  )

  // Load data when folder is expanded and we don't have the data yet
  useEffect(() => {
    if (isExpanded && isFolder && (!childResources || childResources.length === 0)) {
      setGetData(true)
    }
  }, [isExpanded, isFolder])

  // Update child resources map when data is loaded
  useEffect(() => {
    if (resources?.resources?.data) {
      const children = resources.resources.data || []
      setChildResourcesMap((prev) => ({
        ...prev,
        [resourceId]: children,
      }))
    }
  }, [resources, resourceId, setChildResourcesMap])
  
  // Handle parent deselection
  useEffect(() => {
    // When a parent is deselected and there are selected children,
    // the selection logic is handled by onToggleSelection
  }, [isSelected])

  // Get child resources
  const childResources = childResourcesMap[resourceId] || []

  // Handle selection of newly loaded children
  useEffect(() => {
    // When new children are loaded and the parent is selected
    if (isSelected && isFolder && childResources.length > 0) {
      // This is now handled by onToggleSelection, which will cascade selection
    }
  }, [childResources.length, isSelected, isFolder])

  // Check if all children are selected (for indeterminate state)
  const hasChildren = childResources.length > 0
  const allChildrenSelected =
    hasChildren && childResources.every((child) => selectedResources.includes(child.resource_id))
  const someChildrenSelected =
    hasChildren && childResources.some((child) => selectedResources.includes(child.resource_id))
  
  // Indeterminate state: some children selected but not all
  const isIndeterminate = someChildrenSelected && !allChildrenSelected

  const handleCheckboxChange = () => {
    onToggleSelection(resourceId, isFolder);
  }

  const handleRowClick = (e: React.MouseEvent) => {
    if (isFolder) {
      e.stopPropagation();
      if (isExpanded) {
        setExpandedFolders((prev) => prev.filter((id) => id !== resourceId));
      } else {
        setExpandedFolders((prev) => [...prev, resourceId]);
      }
    }
  }

  return (
    <>
      <TableRow
        key={resourceId}
        className={`hover:bg-muted/50 ${isExpanded ? "bg-muted/50" : ""}`}
        onClick={handleRowClick}
        style={{ cursor: isFolder ? "pointer" : "default" }}
      >
        <TableCell className="w-[50px]">
          <div className="flex items-center py-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleCheckboxChange}
              disabled={isProcessing}
              onClick={(e) => e.stopPropagation()}
              data-resource-id={resourceId}
              ref={(checkbox) => {
                if (checkbox && isIndeterminate) {
                  ;(checkbox as unknown as HTMLInputElement).indeterminate = true
                }
              }}
            />
          </div>
        </TableCell>
        <TableCell className="w-[50px] px-2 py-2 whitespace-nowrap" style={{ paddingLeft: `${depth * 20}px` }}>
          <div className="flex items-center">
            {isFolder &&
              (isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground mr-1" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground mr-1" />
              ))}
            {isFolder ? (
              isExpanded ? (
                <FolderOpen className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Folder className="h-5 w-5 text-muted-foreground" />
              )
            ) : (
              <File className="ml-5 h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </TableCell>
        <TableCell className="w-[50px] px-2 py-2" style={{ width: '50px', minWidth: '50px', maxWidth: '50px' }}>
          <div className="w-full overflow-hidden">
            <span
              className={`${isFolder ? "text-foreground font-medium" : "text-foreground"} block truncate`}
              title={fileName}
              style={{ 
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {fileName}
            </span>
          </div>
        </TableCell>
        {showDateColumn && (
          <TableCell className="w-[120px] hidden md:table-cell px-4 py-2 whitespace-nowrap text-sm text-muted-foreground">
            {resource.created_at && new Intl.DateTimeFormat("en-US").format(new Date(resource.created_at))}
          </TableCell>
        )}
        <TableCell className="w-[120px] px-4 py-2 whitespace-nowrap">
          <StatusBadge status={resource.status} resourceId={resourceId} indexingStatus={indexingStatus} />
        </TableCell>
        <TableCell className="w-[20px] px-4 py-2 whitespace-nowrap text-right">
          <div className="flex justify-end space-x-2">
            {indexingStatus[resourceId] === ResourceState.SYNCHRONIZED && (
              <Button
                type="button"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  onRemoveResource(resource)
                }}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* Expanded folder with children */}
      {isExpanded && (
        <>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={showDateColumn ? 6 : 5}>
                <div className="flex items-center py-2" style={{ paddingLeft: `${depth * 20 + 48}px` }}>
                  <RefreshCw className="h-4 w-4 text-blue-500 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : childResources.length > 0 ? (
            // Render child resources recursively
            childResources.map((childResource) => (
              <ResourceItem
                key={childResource.resource_id}
                resource={childResource}
                depth={depth + 1}
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
            <TableRow>
              <TableCell colSpan={showDateColumn ? 6 : 5}>
                <div className="py-2 text-sm text-muted-foreground" style={{ paddingLeft: `${depth * 20 + 48}px` }}>
                  This folder is empty
                </div>
              </TableCell>
            </TableRow>
          )}
        </>
      )}
    </>
  )
}