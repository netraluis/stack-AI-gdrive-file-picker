"use client"
import { useState, useEffect } from "react"
import type React from "react"

import {
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  Search,
  Trash2,
  Check,
  RefreshCw,
  Plus,
  ArrowUpDown,
  Filter,
  FolderOpen,
  PanelLeftClose,
  Menu,
  LogOut,
} from "lucide-react"
import { useAuth } from "../context/authContext"
import { useResources } from "../hooks/useResources"
import { useCreateKnowledgeBase } from "../hooks/useKnowledgeBase"
import { useTriggerSync } from "../hooks/useTriggerSync"
import { useDeleteKnowledgeBaseResource, useKnowledgeBaseResources } from "../hooks/useKnowledgeBaseResources"
import { useKnowledgeBaseStore } from "../store/knowledgeBaseStore"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import type { Resource } from "../types/stackApi"

// Define resource interface

interface ResourceItemProps {
  resource: Resource
  depth?: number
  expandedFolders: string[]
  setExpandedFolders: React.Dispatch<React.SetStateAction<string[]>>
  selectedResources: string[]
  setSelectedResources: React.Dispatch<React.SetStateAction<string[]>>
  onRemoveResource: (resource: Resource) => void
  childResourcesMap: Record<string, Resource[]>
  setChildResourcesMap: React.Dispatch<React.SetStateAction<Record<string, Resource[]>>>
  showDateColumn: boolean
  connectionId: string
  authToken: string
  indexingStatus: Record<string, string>
  setIndexingStatus: React.Dispatch<React.SetStateAction<Record<string, ResourceState>>>
}

enum ResourceState {
  INDEXING = "indexing",
  REMOVING = "removing",
  INDEXED = "indexed",
  FAILED = "failed",
  SYNCHRONIZED = "synchronized",
  SYNCRONIZING = "synchronizing",
  RESOURCE = "resource",
}

// ResourceItem component - renders a single file/folder row with nested children
const ResourceItem = ({
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
}: ResourceItemProps) => {
  const resourceId = resource.resource_id
  const isFolder = resource.inode_type === "directory"
  const isExpanded = expandedFolders.includes(resourceId)
  const isSelected = selectedResources.includes(resourceId)
  const fileName = resource.inode_path.path.split("/").filter(Boolean).pop() || ""
  const isProcessing = indexingStatus[resourceId] === "indexing" || indexingStatus[resourceId] === "removing"
  const [getData, setGetData] = useState(false)

  const { resources, isLoading } = useResources(getData ? connectionId : null, authToken, resourceId)

  // Load data when folder is expanded and we don't have the data yet
  useEffect(() => {
    if (isExpanded && isFolder && (!childResources || childResources.length === 0)) {
      setGetData(true)
    }
  }, [isExpanded])

  useEffect(() => {
    if (!childResourcesMap[resourceId] || childResourcesMap[resourceId].length === 0) {
      const children = resources?.resources?.data || []
      setChildResourcesMap((prev) => ({
        ...prev,
        [resourceId]: children,
      }))
    }
  }, [resources])

  useEffect(() => {
    // When a parent is deselected, deselect all children
    if (!isSelected && isFolder) {
      deselectAllChildren(resourceId)
    }
  }, [isSelected])

  // Get child resources if they exist in the map
  const childResources = childResourcesMap[resourceId] || []

  useEffect(() => {
    // When new children are loaded and the parent is selected
    if (isSelected && isFolder && childResources.length > 0) {
      // Automatically select all newly loaded children
      selectAllChildren(resourceId)
    }
  }, [childResources.length])

  // Check if all children are selected (for indeterminate state)
  const hasChildren = childResources.length > 0
  const allChildrenSelected =
    hasChildren && childResources.every((child) => selectedResources.includes(child.resource_id))

  const someChildrenSelected =
    hasChildren && childResources.some((child) => selectedResources.includes(child.resource_id))

  // Indeterminate state: some children selected but not all
  const isIndeterminate = someChildrenSelected && !allChildrenSelected

  const toggleExpand = async (e: React.MouseEvent<HTMLTableRowElement>) => {
    e.stopPropagation()
    if (!isFolder) return

    if (isExpanded) {
      // Collapse folder
      setExpandedFolders((prev) => prev.filter((id) => id !== resourceId))
    } else {
      // Expand folder
      setExpandedFolders((prev) => [...prev, resourceId])
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toggleSelection = async (e: any) => {
    // If this is an event object with stopPropagation, use it
    if (e && typeof e.stopPropagation === "function") {
      e.stopPropagation()
    }

    if (isSelected) {
      // Deselect this resource
      setSelectedResources((prev) => prev.filter((id) => id !== resourceId))

      // If it's a folder, also deselect all children recursively
      if (isFolder) {
        deselectAllChildren(resourceId)
      }
    } else {
      // Select this resource
      setSelectedResources((prev) => [...prev, resourceId])

      // If it's a folder, mark all its children as selected
      if (isFolder) {
        // If children are already loaded, select them
        if (childResources.length > 0) {
          selectAllChildren(resourceId)
        }
        // If no children are loaded, they will be selected when loaded
      }
    }
  }

  const selectAllChildren = (folderId: string) => {
    setSelectedResources((prev) => {
      const newSelection = [...prev]

      // Add all known children recursively
      const addChildren = (parentId: string) => {
        const children = childResourcesMap[parentId] || []

        for (const child of children) {
          if (!newSelection.includes(child.resource_id)) {
            newSelection.push(child.resource_id)
          }

          // If this child is a folder, add its children too
          if (child.inode_type === "directory") {
            addChildren(child.resource_id)
          }
        }
      }

      addChildren(folderId)
      return newSelection
    })
  }

  const deselectAllChildren = (folderId: string) => {
    setSelectedResources((prev) => {
      let newSelection = [...prev]

      // Remove all known children recursively
      const removeChildren = (parentId: string) => {
        const children = childResourcesMap[parentId] || []

        for (const child of children) {
          newSelection = newSelection.filter((id) => id !== child.resource_id)

          // If this child is a folder, remove its children too
          if (child.inode_type === "directory") {
            removeChildren(child.resource_id)
          }
        }
      }

      removeChildren(folderId)
      return newSelection
    })
  }

  // Actualiza la función getStatusBadge para usar clases de Tailwind directamente
  const getStatusBadge = () => {
    // First check processing status
    if (indexingStatus[resourceId]) {
      const status = indexingStatus[resourceId] as ResourceState

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
        <Badge variant="default" className={statusClasses[status]}>
          {status === ResourceState.INDEXING
            ? "indexing..."
            : status === ResourceState.REMOVING
              ? "removing..."
              : status}
        </Badge>
      )
    }

    return (
      resource.status && (
        <Badge variant="default" className="bg-gray-500 hover:bg-gray-600 text-white">
          {resource.status}
        </Badge>
      )
    )
  }

  return (
    <>
      <TableRow
        key={resourceId}
        className={`hover:bg-muted/50 ${isExpanded ? "bg-muted/50" : ""}`}
        onClick={isFolder ? toggleExpand : undefined}
        style={{ cursor: isFolder ? "pointer" : "default" }}
      >
        <TableCell className="w-[50px]">
          <div className="flex items-center py-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={toggleSelection}
              disabled={isProcessing}
              onClick={(e) => e.stopPropagation()}
              data-resource-id={resourceId}
              ref={(checkbox) => {
                if (checkbox && isIndeterminate) {
                  ; (checkbox as unknown as HTMLInputElement).indeterminate = true
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
                <FolderOpen className="h-5 w-5 text-blue-500" />
              ) : (
                <Folder className="h-5 w-5 text-muted-foreground" />
              )
            ) : (
              <File className="ml-5 h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </TableCell>
        <TableCell className="w-[250px] px-2 py-2 whitespace-nowrap">
          <span
            className={`${isFolder ? "text-blue-600 font-medium" : "text-foreground"} truncate block`}
            title={fileName}
          >
            {fileName}
          </span>
        </TableCell>
        {showDateColumn && (
          <TableCell className="w-[150px] px-4 py-2 whitespace-nowrap text-sm text-muted-foreground">
            {resource.created_at && new Intl.DateTimeFormat("en-US").format(new Date(resource.created_at))}
          </TableCell>
        )}
        <TableCell className="w-[120px] px-4 py-2 whitespace-nowrap">{getStatusBadge()}</TableCell>
        <TableCell className="w-[100px] px-4 py-2 whitespace-nowrap text-right">
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

// KnowledgeBaseHistory component for the sidebar
interface KnowledgeBaseHistorySidebarProps {
  knowledgeBaseHistory: string[]
  switchToKnowledgeBase: (id: string) => void
  removeFromHistory: (id: string) => void
}

const KnowledgeBaseHistorySidebar = ({
  knowledgeBaseHistory,
  switchToKnowledgeBase,
  removeFromHistory,
}: KnowledgeBaseHistorySidebarProps) => {
  return (
    <ScrollArea className="flex-1">
      <div className="px-2 py-2">
        <h3 className="mb-2 px-4 text-sm font-semibold">Knowledge Base History</h3>
        {knowledgeBaseHistory.length === 0 ? (
          <div className="px-4 py-3 text-sm text-muted-foreground">No history available</div>
        ) : (
          <div className="space-y-1">
            {knowledgeBaseHistory.map((id) => (
              <div key={id} className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => switchToKnowledgeBase(id)}
                  className="text-sm justify-start h-auto py-1 px-2 w-[80%]"
                >
                  <File className="h-4 w-4 mr-2" />
                  <span className="truncate" title={id}>
                    {id.substring(0, 8)}...
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromHistory(id)}
                  className="h-7 w-7 text-destructive hover:text-destructive/90 hover:bg-background"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  )
}

export default function FilePickerKnowledge() {
  const { connectionId, authToken, orgId, email, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Root resources state
  const [expandedFolders, setExpandedFolders] = useState<string[]>([])
  const [selectedResources, setSelectedResources] = useState<string[]>([])
  const [childResourcesMap, setChildResourcesMap] = useState<Record<string, Resource[]>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")
  const [hasSynced, setHasSynced] = useState(false)
  // Update the indexingStatus state type
  const [indexingStatus, setIndexingStatus] = useState<Record<string, ResourceState>>({})
  const [showDateColumn, setShowDateColumn] = useState(true)

  // Use the custom hook to fetch root resources
  const { resources, isLoading, error, mutate } = useResources(connectionId, authToken)

  // KB creation hook
  const { trigger: createKB, data: dataKB, error: errorKB } = useCreateKnowledgeBase()

  const {
    knowledgeBaseId,
    exists: kbExists,
    isSyncing,
    knowledgeBaseHistory,
    setKnowledgeBase,
    clearKnowledgeBase,
    switchToKnowledgeBase,
    removeFromHistory,
    setSyncing,
  } = useKnowledgeBaseStore()

  const { trigger: sync,} = useTriggerSync(orgId, knowledgeBaseId)

  const {
    data: KBResourcesData,
    error: KBResourcesError,
    mutate: KBResourcesMutate,
  } = useKnowledgeBaseResources(knowledgeBaseId, authToken)

  const {
    trigger: deleteKB
  } = useDeleteKnowledgeBaseResource(knowledgeBaseId)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const ActionButtons = () => (
    <div className="flex space-x-2 w-full sm:w-auto">
      {kbExists ? (
        <>
          {!hasSynced && (
            <Button
              onClick={syncIndexedFiles}
              variant="default"
              disabled={isSyncing || selectedResources.length === 0}
              className="flex items-center gap-1 w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing..." : "Sync"}
            </Button>
          )}
          <Button
            onClick={() => clearKnowledgeBase()}
            variant="outline"
            className="flex items-center gap-1 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            New KB
          </Button>
        </>
      ) : (
        <Button
          onClick={indexSelectedFiles}
          variant="default"
          disabled={selectedResources.length === 0}
          className="flex items-center gap-1 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Index Selected ({selectedResources.length})
        </Button>
      )}
    </div>
  )

  // Update the useEffect for KBResourcesData
  useEffect(() => {
    if (KBResourcesData && KBResourcesData?.resources?.data) {
      // Update status to indexed
      const indexedStatus: Record<string, ResourceState> = {}
      selectedResources.forEach((id) => {
        if (
          indexedStatus[id] !== ResourceState.SYNCHRONIZED &&
          KBResourcesData?.resources?.data?.some((resource: Resource) => resource.resource_id === id)
        ) {
          indexedStatus[id] = ResourceState.SYNCHRONIZED
        }
      })

      setIndexingStatus((prev) => ({
        ...prev,
        ...indexedStatus,
      }))
    }
  }, [KBResourcesData, KBResourcesError])

  useEffect(() => {
    if (dataKB?.knowledgeBase?.knowledge_base_id) {
      setKnowledgeBase(dataKB?.knowledgeBase?.knowledge_base_id)
      toast.success(`Knowledge Base Created ID: ${dataKB?.knowledgeBase?.knowledge_base_id.substring(0, 8)}...`)
    }
  }, [dataKB])

  useEffect(() => {
    if (error) {
      toast.error("Error loading resources", {
        description: error.message || "Failed to load resources",
      })
    }
  }, [error])

  useEffect(() => {
    if (errorKB) {
      toast.error("Error creating Knowledge Base", {
        description: errorKB.message || "Failed to create Knowledge Base",
      })
    }
  }, [errorKB])

  // Extract root resources from the response
  const rootResources = resources?.resources?.data || []

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Update the indexSelectedFiles function
  const indexSelectedFiles = async () => {
    if (selectedResources.length === 0) return

    try {
      // Get only file IDs (not folders)
      const leafResourceIds = getLeafNodeResourceIds()

      if (leafResourceIds.length === 0) {
        toast.error("Please select at least one file to index")
        return
      }

      // Mark files as indexing
      const updatedStatus: Record<string, ResourceState> = {}
      selectedResources.forEach((id) => {
        updatedStatus[id] = ResourceState.INDEXING
      })

      setIndexingStatus((prev) => ({
        ...prev,
        ...updatedStatus,
      }))

      toast.info(`${leafResourceIds.length} files selected for indexing`)

      // Create knowledge base using only leaf node IDs
      await createKB({
        authToken,
        body: {
          connectionId,
          connectionSourceIds: leafResourceIds,
          name: "Knowledge Base " + new Date().toLocaleString(),
        },
      })

      // Update status to indexed
      const indexedStatus: Record<string, ResourceState> = {}
      selectedResources.forEach((id) => {
        indexedStatus[id] = ResourceState.INDEXED
      })

      setIndexingStatus((prev) => ({
        ...prev,
        ...indexedStatus,
      }))

      toast.success("Files have been successfully indexed")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error indexing files:", error)

      toast.error("Failed to index selected files", {
        description: error.message || "Failed to index selected files",
      })

      // Update status to failed
      const failedStatus: Record<string, ResourceState> = {}
      selectedResources.forEach((id) => {
        failedStatus[id] = ResourceState.FAILED
      })

      setIndexingStatus((prev) => ({
        ...prev,
        ...failedStatus,
      }))
    }
  }

  // Update the syncIndexedFiles function
  const syncIndexedFiles = async () => {
    if (selectedResources.length === 0) return

    try {
      // Mark files as syncing
      const updatedStatus: Record<string, ResourceState> = {}
      selectedResources.forEach((id) => {
        if (indexingStatus[id] === ResourceState.INDEXED) {
          updatedStatus[id] = ResourceState.SYNCRONIZING
        }
      })

      setIndexingStatus((prev) => ({
        ...prev,
        ...updatedStatus,
      }))

      setSyncing(true)

      toast.info("Please wait while your knowledge base is being synchronized")

      await sync({ authToken })

      setSyncing(false)

      setHasSynced(true)

      toast.success("Knowledge base has been synchronized successfully")
      KBResourcesMutate()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error syncing files:", error)

      setSyncing(false)

      toast.error("Failed to synchronize knowledge base", {
        description: error.message || "Failed to synchronize knowledge base",
      })

      // Update status to failed
      const failedStatus: Record<string, ResourceState> = {}
      selectedResources.forEach((id) => {
        failedStatus[id] = ResourceState.FAILED
      })

      setIndexingStatus((prev) => ({
        ...prev,
        ...failedStatus,
      }))
    }
  }

  // Update the handleRemoveResource function
  const handleRemoveResource = async (resource: Resource) => {
    const resourceId = resource.resource_id
    try {
      // Mark as removing
      setIndexingStatus((prev) => ({
        ...prev,
        [resourceId]: ResourceState.REMOVING,
      }))

      toast.info(`Removing ${resource.inode_path.path.split("/").filter(Boolean).pop() || ""}`)

      // Remove from selected resources
      setSelectedResources((prev) => prev.filter((id) => id !== resourceId))

      await deleteKB({
        resourcePath: resource.inode_path.path,
        token: authToken,
      })

      setIndexingStatus((prev = {}) => {
        return { ...prev, [resourceId]: ResourceState.RESOURCE }
      })

      toast.success("The resource has been removed successfully")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(`Error removing resource ${resourceId}:`, error)

      toast.error("Failed to remove resource", {
        description: error.message || "Failed to remove resource",
      })

      setIndexingStatus((prev) => ({
        ...prev,
        [resourceId]: ResourceState.FAILED,
      }))
    }
  }

  const getLeafNodeResourceIds = () => {
    // Final result: IDs of leaf resources
    const result: string[] = []
    // Keep track of which IDs are parents of other selected IDs
    const parentIds = new Set()

    // Identify all resources that are parents of other selected resources
    selectedResources.forEach((id) => {
      const children = childResourcesMap[id] || []
      children.forEach((child) => {
        if (selectedResources.includes(child.resource_id)) {
          // This resource is a parent of another selected resource
          parentIds.add(id)
        }
      })
    })

    // Leaf resources are the selected ones that are NOT parents
    selectedResources.forEach((id) => {
      if (!parentIds.has(id)) {
        result.push(id)
      }
    })

    return result
  }

  // Filter resources by search term
  const filteredRootResources = rootResources.filter((resource) => {
    const path = resource.inode_path.path.toLowerCase()
    return path.includes(searchTerm.toLowerCase())
  })

  // Sort resources
  const sortedRootResources = [...filteredRootResources].sort((a, b) => {
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
    } else if (sortField === "created_at") {
      valA = a.created_at ? new Date(a.created_at).getTime() : 0
      valB = b.created_at ? new Date(b.created_at).getTime() : 0
    } else {
      // valA = a[sortField] || ""
      // valB = b[sortField] || ""
      return 1
    }

    const comparison = valA === valB ? 0 : valA > valB ? 1 : -1;

    return sortDirection === "asc" ? comparison : -comparison
  })

  return (
    <div className="fixed inset-0 flex w-full h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "h-screen bg-card border-r border-border transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-64" : "w-0",
        )}
      >
        {sidebarOpen && (
          <div className="h-full flex flex-col">
            <div className="p-4 flex items-center justify-between border-b shrink-0">
              <h2 className="text-lg font-semibold">Knowledge Base</h2>
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <KnowledgeBaseHistorySidebar
                knowledgeBaseHistory={knowledgeBaseHistory}
                switchToKnowledgeBase={switchToKnowledgeBase}
                removeFromHistory={removeFromHistory}
              />
            </div>
            <div className="p-4 border-t shrink-0">
              {kbExists && (
                <div className="text-xs text-muted-foreground mb-2">
                  <span className="font-medium">Active KB:</span>
                  <span className="ml-1 truncate block">{knowledgeBaseId}</span>
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full" onClick={() => clearKnowledgeBase()}>
                {kbExists ? "Reset KB" : "Create New KB"}
              </Button>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Card className="flex-1 border-0 rounded-none shadow-none flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
                {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
              <CardTitle>Google Drive File Picker</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center mr-4">
                <span className="text-sm text-muted-foreground mr-2">{email}</span>
                <Button onClick={logout} variant="outline" size="sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={() => mutate()} className="flex items-center gap-1">
                <RefreshCw className="h-4 w-4" /> Refresh
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setShowDateColumn(!showDateColumn)}>
                    <div className="flex items-center">
                      {showDateColumn && <Check className="h-4 w-4 mr-2" />}
                      <span>Show Created at</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex flex-col space-y-4">
            {/* Search, actions and KB history */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-auto sm:flex-grow max-w-md">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search files and folders..."
                    className="pl-8 w-full"
                  />
                </div>
              </div>

              <ActionButtons />
            </div>

            {/* Active KB indicator */}
            {kbExists && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertTitle className="text-blue-800">Active Knowledge Base</AlertTitle>
                <AlertDescription className="flex justify-between items-center">
                  <span className="text-blue-600">{knowledgeBaseId}</span>
                  <Button onClick={() => clearKnowledgeBase()} variant="outline" size="sm" className="text-sm">
                    Reset
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Files table with fixed header and scrollable body */}
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
                      {showDateColumn && <TableHead className="w-[170px] cursor-pointer" onClick={() => handleSort("created_at")}><div className="flex items-center">Created At {sortField === "created_at" && <ArrowUpDown className="ml-1 h-4 w-4" />}</div></TableHead>}
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
                      // Loading skeleton
                      Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <TableRow key={i}>
                            <TableCell className="w-[50px]">
                              <Skeleton className="h-4 w-4" />
                            </TableCell>
                            <TableCell className="w-[50px]">
                              <Skeleton className="h-5 w-5" />
                            </TableCell>
                            <TableCell className="w-[250px]">
                              <Skeleton className="h-4 w-32" />
                            </TableCell>
                            {showDateColumn && (
                              <TableCell className="w-[150px]">
                                <Skeleton className="h-4 w-24" />
                              </TableCell>
                            )}
                            <TableCell className="w-[120px]">
                              <Skeleton className="h-4 w-16" />
                            </TableCell>
                            <TableCell className="w-[100px] text-right">
                              <Skeleton className="h-4 w-8 ml-auto" />
                            </TableCell>
                          </TableRow>
                        ))
                    ) : sortedRootResources.length > 0 ? (
                      // Root resources with hierarchical children
                      sortedRootResources.map((resource) => (
                        <ResourceItem
                          key={resource.resource_id}
                          resource={resource}
                          depth={0}
                          expandedFolders={expandedFolders}
                          setExpandedFolders={setExpandedFolders}
                          selectedResources={selectedResources}
                          setSelectedResources={setSelectedResources}
                          onRemoveResource={handleRemoveResource}
                          childResourcesMap={childResourcesMap}
                          setChildResourcesMap={setChildResourcesMap}
                          showDateColumn={showDateColumn}
                          connectionId={connectionId}
                          authToken={authToken}
                          indexingStatus={indexingStatus}
                          setIndexingStatus={setIndexingStatus}
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

            {/* File indexing progress indicator */}
            {Object.values(indexingStatus).some((status) => status === ResourceState.INDEXING) && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertTitle className="text-blue-800">Indexing files...</AlertTitle>
                <AlertDescription className="space-y-2">
                  <div className="w-full bg-blue-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full w-3/4 animate-pulse"></div>
                  </div>
                  <p className="text-sm text-blue-700">
                    Please wait while your files are being indexed. This may take a moment.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Selected files indicator */}
            {selectedResources.length > 0 && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="flex justify-between items-center">
                  <span className="text-blue-800">{selectedResources.length} file(s) selected</span>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedResources([])}>
                      Clear selection
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={indexSelectedFiles}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> Index Selected
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
