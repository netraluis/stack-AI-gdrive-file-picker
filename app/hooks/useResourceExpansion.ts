import { useState, useCallback } from 'react'

/**
 * Custom hook to manage folder expansion state
 */
export function useResourceExpansion() {
  const [expandedFolders, setExpandedFolders] = useState<string[]>([])
  
  /**
   * Toggles expansion state of a folder
   */
  const toggleExpand = useCallback((resourceId: string) => {
    setExpandedFolders(prev => {
      if (prev.includes(resourceId)) {
        // Collapse folder
        return prev.filter(id => id !== resourceId)
      } else {
        // Expand folder
        return [...prev, resourceId]
      }
    })
  }, [])
  
  /**
   * Checks if a folder is expanded
   */
  const isExpanded = useCallback((resourceId: string) => {
    return expandedFolders.includes(resourceId)
  }, [expandedFolders])
  
  /**
   * Expands a folder
   */
  const expandFolder = useCallback((resourceId: string) => {
    if (!expandedFolders.includes(resourceId)) {
      setExpandedFolders(prev => [...prev, resourceId])
    }
  }, [expandedFolders])
  
  /**
   * Collapses a folder
   */
  const collapseFolder = useCallback((resourceId: string) => {
    setExpandedFolders(prev => prev.filter(id => id !== resourceId))
  }, [])
  
  return {
    expandedFolders,
    setExpandedFolders,
    toggleExpand,
    isExpanded,
    expandFolder,
    collapseFolder
  }
}