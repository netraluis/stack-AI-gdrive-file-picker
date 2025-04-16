import { useState, useCallback } from 'react'
import { ResourceChildrenMap } from '../types/resourcesTypes'
import { Resource } from '../lib/connectionsApi'


/**
 * Custom hook to manage resource selection state and logic
 */
export function useResourceSelection() {
  const [selectedResources, setSelectedResources] = useState<string[]>([])
  const [childResourcesMap, setChildResourcesMap] = useState<ResourceChildrenMap>({})

  /**
   * Toggles selection state of a resource and its children
   */
  const toggleSelection = useCallback((resourceId: string, isFolder: boolean) => {
    setSelectedResources((prev) => {
      const isSelected = prev.includes(resourceId)
      
      if (isSelected) {
        // Deselect this resource
        const newSelection = prev.filter((id) => id !== resourceId)
        
        // If it's a folder, also deselect all children recursively
        if (isFolder) {
          return deselectAllChildren(resourceId, newSelection)
        }
        
        return newSelection
      } else {
        // Select this resource
        const newSelection = [...prev, resourceId]
        
        // If it's a folder, select all its children
        if (isFolder) {
          // Add all children to selection
          return selectAllChildren(resourceId, newSelection)
        }
        
        return newSelection
      }
    })
  }, [childResourcesMap])

  /**
   * Selects all children of a folder recursively
   */
  const selectAllChildren = useCallback((folderId: string, selectedIds: string[] = [...selectedResources]) => {
    let newSelection = [...selectedIds]
    
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
  }, [childResourcesMap, selectedResources])

  /**
   * Deselects all children of a folder recursively
   */
  const deselectAllChildren = useCallback((folderId: string, selectedIds: string[] = [...selectedResources]) => {
    let newSelection = [...selectedIds]
    
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
  }, [childResourcesMap, selectedResources])

  /**
   * Updates the child resources map when new data is loaded
   */
  const updateChildResourcesMap = useCallback((resourceId: string, children: Resource[]) => {
    setChildResourcesMap(prev => ({
      ...prev,
      [resourceId]: children
    }))
  }, [])

  /**
   * Gets only leaf node resource IDs (no parent folders)
   */
  const getLeafNodeResourceIds = useCallback(() => {
    // Final result: IDs of leaf resources
    const result: string[] = []
    // Keep track of which IDs are parents of other selected IDs
    const parentIds = new Set()

    // Identify all resources that are parents of other selected resources
    selectedResources.forEach((id) => {
      const children = childResourcesMap[id] || []
      children.forEach((child: Resource) => {
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
  }, [selectedResources, childResourcesMap])

  return {
    selectedResources,
    setSelectedResources,
    childResourcesMap,
    setChildResourcesMap,
    toggleSelection,
    selectAllChildren,
    deselectAllChildren,
    updateChildResourcesMap,
    getLeafNodeResourceIds
  }
}