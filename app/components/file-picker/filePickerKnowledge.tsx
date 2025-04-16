"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  RefreshCw, 
  Plus, 
  Filter, 
  PanelLeftClose, 
  Menu, 
  LogOut, 
  Check 
} from "lucide-react"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { useAuth } from "@/app/context/authContext"
import { useCreateKnowledgeBase } from "@/app/hooks/useKnowledgeBase"
import { useKnowledgeBaseResources, useDeleteKnowledgeBaseResource } from "@/app/hooks/useKnowledgeBaseResources"
import { useResourceExpansion } from "@/app/hooks/useResourceExpansion"
import { useResources } from "@/app/hooks/useResources"
import { useResourceSelection } from "@/app/hooks/useResourceSelection"
import { useTriggerSync } from "@/app/hooks/useTriggerSync"
import { Resource } from "@/app/lib/connectionsApi"
import { useKnowledgeBaseStore } from "@/app/store/knowledgeBaseStore"
import { ResourceState } from "@/app/types/resourcesTypes"
import { ActionBar } from "./actionBar"
import { KnowledgeBaseHistorySidebar } from "./knowledgeBaseHistorySidebar"
import { ResourceTable } from "./resourceTable"


/**
 * Main component for the file picker with knowledge base integration
 */
export default function FilePickerKnowledge() {
  const { connectionId, authToken, orgId, email, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [hasSynced, setHasSynced] = useState(false)
  const [showDateColumn, setShowDateColumn] = useState(true)
  const [indexingStatus, setIndexingStatus] = useState<Record<string, ResourceState>>({})

  // Custom hooks for resource management
  const { 
    selectedResources, 
    setSelectedResources, 
    childResourcesMap, 
    setChildResourcesMap, 
    toggleSelection, 
    getLeafNodeResourceIds 
  } = useResourceSelection()
  
  const { 
    expandedFolders, 
    setExpandedFolders 
  } = useResourceExpansion()

  // Use the custom hook to fetch root resources
  const { 
    resources, 
    isLoading, 
    error, 
    mutate 
  } = useResources(connectionId, authToken)

  // Knowledge base hooks
  const { 
    trigger: createKB, 
    data: dataKB, 
    error: errorKB, 
  } = useCreateKnowledgeBase()

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
    setKnowledgeBaseHistory,
  } = useKnowledgeBaseStore()

  const { 
    trigger: sync 
  } = useTriggerSync(orgId, knowledgeBaseId)

  const {
    data: KBResourcesData,
    mutate: KBResourcesMutate,
  } = useKnowledgeBaseResources(knowledgeBaseId, authToken)


  const {
    trigger: deleteKB,
  } = useDeleteKnowledgeBaseResource(knowledgeBaseId)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  
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
  }, [KBResourcesData, selectedResources])

  // Update knowledge base state when created
  useEffect(() => {
    if (dataKB?.knowledgeBase?.knowledge_base_id) {
      setKnowledgeBase(dataKB.knowledgeBase.knowledge_base_id)
      toast.success(`Knowledge Base Created ID: ${dataKB.knowledgeBase.knowledge_base_id.substring(0, 8)}...`)
    }
  }, [dataKB, setKnowledgeBase])

  // Handle API errors
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
  const rootResources = kbExists && KBResourcesData?.resources?.data && hasSynced
    ? KBResourcesData.resources.data 
    : resources?.resources?.data || []


  // Index selected files
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

  // Sync indexed files
  const syncIndexedFiles = async () => {
    if (selectedResources.length === 0) return

    try {
      // Mark files as syncing
      const updatedStatus: Record<string, ResourceState> = {}
      selectedResources.forEach((id) => {
        updatedStatus[id] = ResourceState.SYNCRONIZING
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

      // Force a refresh of the KB resources data
      await KBResourcesMutate()

      // Update status to synchronized
      const synchronizedStatus: Record<string, ResourceState> = {}
      selectedResources.forEach((id) => {
        synchronizedStatus[id] = ResourceState.SYNCHRONIZED
      })

      setIndexingStatus((prev) => ({
        ...prev,
        ...synchronizedStatus,
      }))

      toast.success("Knowledge base has been synchronized successfully")
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

  // Remove resource handler
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

  const resetAllStates = () => {
    // Clear selection states
    setSelectedResources([])
    setSearchTerm("")
    setHasSynced(false)
    setIndexingStatus({})
    setShowDateColumn(true)
    
    // Clear knowledge base but preserve ID in history
    const currentKbId = knowledgeBaseId
    clearKnowledgeBase()
    if (currentKbId && !knowledgeBaseHistory.includes(currentKbId)) {
      setKnowledgeBaseHistory([...knowledgeBaseHistory, currentKbId])
    }
  }

  const handleKBChange = async (kbId: string) => {
    // Reset states when switching KB
    setSelectedResources([])
    setSearchTerm("")
    setHasSynced(false)
    
    // Switch to the new KB
    switchToKnowledgeBase(kbId)
    
    // Force refresh KB resources and wait for it to complete
    await KBResourcesMutate()
    setHasSynced(true)
  }

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
                switchToKnowledgeBase={handleKBChange}
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
              <Button variant="outline" size="sm" className="w-full" onClick={resetAllStates}>
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
                      <span>Show created at</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex flex-col space-y-4">
            {/* Search and action buttons */}
            <ActionBar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              onIndexSelected={indexSelectedFiles}
              onSync={syncIndexedFiles}
              onNewKB={resetAllStates}
              selectedCount={selectedResources.length}
              kbExists={kbExists}
              isSyncing={isSyncing}
              hasSynced={hasSynced}
            />

            {/* Active KB indicator */}
            {kbExists && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertTitle className="text-blue-800">Active Knowledge Base</AlertTitle>
                <AlertDescription className="flex justify-between items-center">
                  <span className="text-blue-600">{knowledgeBaseId}</span>
                  <Button onClick={resetAllStates} variant="outline" size="sm" className="text-sm">
                    Reset
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Resources table */}
            <ResourceTable
              resources={rootResources}
              isLoading={isLoading}
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
              searchTerm={searchTerm}
              onToggleSelection={toggleSelection}
            />

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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}