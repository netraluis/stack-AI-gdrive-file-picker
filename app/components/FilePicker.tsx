'use client';
import React, { useState, useEffect } from 'react';
import { Folder, File, ChevronRight, ChevronDown, Search, Trash2, Check, RefreshCw, Plus, ArrowUpDown, Filter, FolderOpen } from 'lucide-react';
import { useAuth } from '../context/authContext';
import { useResources } from '../hooks/useResources';
import { useCreateKnowledgeBase } from '../hooks/useKnowledgeBase';
import { useTriggerSync } from '../hooks/useTriggerSync';
import { useDeleteKnowledgeBaseResource, useKnowledgeBaseResources } from '../hooks/useKnowledgeBaseResources';

// Custom UI components
const Button = ({ children, onClick, variant = "primary", disabled = false, className = "", size = "md" }) => {
  const baseClasses = "rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50";

  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    ghost: "bg-transparent hover:bg-gray-100",
    outline: "border border-gray-300 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
    icon: "p-1"
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, className = "" }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
    />
  );
};

const Badge = ({ children, className = "" }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  );
};

const Skeleton = ({ className = "" }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
};

const Tooltip = ({ children, content }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute z-10 px-2 py-1 text-xs text-white bg-gray-900 rounded bottom-full mb-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

// Dropdown menu component
const Dropdown = ({ trigger, items, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isOpen) setIsOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`}>
      <div onClick={(e) => { e.stopPropagation(); toggleDropdown(); }}>
        {trigger}
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
          {items.map((item, index) => (
            <div
              key={index}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
                setIsOpen(false);
              }}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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
  setIndexingStatus
}) => {


  const isFolder = resource.inode_type === 'directory';
  const resourceId = resource.resource_id;
  const isExpanded = expandedFolders.includes(resourceId);
  const isSelected = selectedResources.includes(resourceId);
  const fileName = resource.inode_path.path.split('/').filter(Boolean).pop() || '';
  const isIndexed = resource.status === 'indexed';
  const isPending = resource.status === 'pending';
  const isSybchronized = resource.status === 'Synchronized';
  const isProcessing = indexingStatus[resourceId] === 'indexing' || indexingStatus[resourceId] === 'removing';
  const [getData, setGetData] = useState(false);



  const { resources, isLoading, error, mutate } = useResources(getData ? connectionId : null, authToken, resourceId);

  // Dentro del componente ResourceItem
  useEffect(() => {
    // Cargar datos sólo cuando la carpeta está expandida y aún no tenemos los datos
    if (isExpanded && isFolder && (!childResources || childResources.length === 0)) {
      setGetData(true)
    }
  }, [isExpanded]); // Dependencia en isExpanded

  useEffect(() => {
    if (!childResourcesMap[resourceId] || childResourcesMap[resourceId].length === 0) {
      const children = resources?.resources?.data || [];
      setChildResourcesMap(prev => ({
        ...prev,
        [resourceId]: children
      }));
    }
  }, [resources]);


  useEffect(() => {
    // Cuando se deselecciona un padre, deseleccionar todos los hijos
    if (!isSelected && isFolder) {
      deselectAllChildren(resourceId);
    }
  }, [isSelected]);

  // Get child resources if they exist in the map
  const childResources = childResourcesMap[resourceId] || [];

  useEffect(() => {
    // Cuando se cargan nuevos hijos y el padre está seleccionado
    if (isSelected && isFolder && childResources.length > 0) {
      // Seleccionar automáticamente todos los hijos recién cargados
      selectAllChildren(resourceId);
    }
  }, [childResources.length]);

  // Check if all children are selected (for indeterminate state)
  const hasChildren = childResources.length > 0;
  const allChildrenSelected = hasChildren && childResources.every(child =>
    selectedResources.includes(child.resource_id)
  );

  const someChildrenSelected = hasChildren && childResources.some(child =>
    selectedResources.includes(child.resource_id)
  );



  // Indeterminate state: some children selected but not all
  const isIndeterminate = someChildrenSelected && !allChildrenSelected;

  const toggleExpand = async (e) => {
    e.stopPropagation();
    if (!isFolder) return;

    if (isExpanded) {
      // Collapse folder
      setExpandedFolders(prev => prev.filter(id => id !== resourceId));
    } else {
      // Expand folder
      setExpandedFolders(prev => [...prev, resourceId]);
    }
  };

  const toggleSelection = async (e) => {
    e.stopPropagation();

    if (isSelected) {
      // Deselect this resource
      setSelectedResources(prev => prev.filter(id => id !== resourceId));

      // If it's a folder, also deselect all children recursively
      if (isFolder) {
        deselectAllChildren(resourceId);
      }

      // Si tiene padre, actualizar el estado del padre
      if (resource.parent_id) {
        // Desmarcar el padre ya que ahora hay al menos un hijo desmarcado
        setSelectedResources(prev => prev.filter(id => id !== resource.parent_id));
      }
    } else {
      // Select this resource
      setSelectedResources(prev => [...prev, resourceId]);

      // If it's a folder, mark all its children as selected
      if (isFolder) {
        // Si ya hay hijos cargados, seleccionarlos
        if (childResources.length > 0) {
          selectAllChildren(resourceId);
        }
        // Si no hay hijos cargados, serán seleccionados cuando se carguen
      }

      // Si tiene padre, verificar si todos los hermanos están seleccionados
      if (resource.parent_id) {
        const siblings = childResourcesMap[resource.parent_id] || [];
        const allSiblingsSelected = siblings.every(sibling =>
          selectedResources.includes(sibling.resource_id) || sibling.resource_id === resourceId
        );

        // Si todos los hermanos están seleccionados, seleccionar también al padre
        if (allSiblingsSelected) {
          setSelectedResources(prev => [...prev, resource.parent_id]);
        }
      }
    }
  };

  const selectAllChildren = (folderId) => {
    setSelectedResources(prev => {
      const newSelection = [...prev];

      // Añadir todos los hijos conocidos recursivamente
      const addChildren = (parentId) => {
        const children = childResourcesMap[parentId] || [];

        for (const child of children) {
          if (!newSelection.includes(child.resource_id)) {
            newSelection.push(child.resource_id);
          }

          // Si este hijo es una carpeta, añadir sus hijos también
          if (child.inode_type === 'directory') {
            addChildren(child.resource_id);
          }
        }
      };

      addChildren(folderId);
      return newSelection;
    });
  };


  const deselectAllChildren = (folderId) => {
    setSelectedResources(prev => {
      let newSelection = [...prev];

      // Eliminar todos los hijos conocidos recursivamente
      const removeChildren = (parentId) => {
        const children = childResourcesMap[parentId] || [];

        for (const child of children) {
          newSelection = newSelection.filter(id => id !== child.resource_id);

          // Si este hijo es una carpeta, eliminar sus hijos también
          if (child.inode_type === 'directory') {
            removeChildren(child.resource_id);
          }
        }
      };

      removeChildren(folderId);
      return newSelection;
    });
  };

  const getStatusBadge = () => {
    // First check processing status
    if (indexingStatus[resourceId]) {
      const status = indexingStatus[resourceId];

      const statusColors = {
        indexing: "bg-blue-100 text-blue-800",
        removing: "bg-orange-100 text-orange-800",
        indexed: "bg-green-100 text-green-800",
        failed: "bg-red-100 text-red-800"
      };

      return (
        <Badge className={statusColors[status] || ''}>
          {status === 'indexing' ? 'indexing...' :
            status === 'removing' ? 'removing...' : status}
        </Badge>
      );
    }

    // Then check resource status
    if (!resource.status) return null;

    const statusColors = {
      indexed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      indexing: "bg-blue-100 text-blue-800",
      failed: "bg-red-100 text-red-800"
    };

    return (
      <Badge className={statusColors[resource.status] || ''}>
        {resource.status}
      </Badge>
    );
  };

  return (
    <>
      <tr
        key={resourceId}
        className={`hover:bg-gray-50 ${isExpanded ? 'bg-gray-50' : ''}`}
        onClick={isFolder ? toggleExpand : undefined}
        style={{ cursor: isFolder ? 'pointer' : 'default' }}
      >
        <td className="whitespace-nowrap">
          <div className="flex items-center py-2" style={{ paddingLeft: `${16}px` }}>
            <div className="relative flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={isSelected && !isIndeterminate}
                onChange={toggleSelection}
                disabled={isProcessing}
                onClick={(e) => e.stopPropagation()}
                data-resource-id={resourceId}
                ref={input => {
                  if (input && isIndeterminate) {
                    input.indeterminate = true;
                  }
                }}
              />
              {/* {isIndeterminate && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-2 h-2 bg-blue-600 rounded-sm"></div>
                </div>
              )} */}
            </div>
          </div>
        </td>
        <td className="px-2 py-2 whitespace-nowrap" style={{ paddingLeft: `${depth * 20}px` }}>
          <div className="flex items-center">
            {isFolder && (
              isExpanded ?
                <ChevronDown className="h-4 w-4 text-gray-500 mr-1" /> :
                <ChevronRight className="h-4 w-4 text-gray-500 mr-1" />
            )}
            {isFolder ? (
              isExpanded ? (
                <FolderOpen className="h-5 w-5 text-blue-500" />
              ) : (
                <Folder className="h-5 w-5 text-gray-500" />
              )) : (
              <File className="ml-5 h-5 w-5 text-gray-500" />
            )}
          </div>
        </td>
        <td className="px-2 py-2 whitespace-nowrap">
          <span className={isFolder ? "text-blue-600 font-medium" : "text-gray-800"}>
            {fileName}
          </span>
        </td>
        {showDateColumn && (
          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
            {resourceId.substring(0, 8)}...
          </td>
        )}
        <td className="px-4 py-2 whitespace-nowrap">
          {getStatusBadge()}
        </td>
        <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex justify-end space-x-2">
            {indexingStatus[resourceId] === 'Synchronized' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveResource(resource);
                }}
                className="text-red-600 hover:text-red-800 p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Expanded folder with children */}
      {isExpanded && (
        <>
          {isLoading ? (
            <tr>
              <td colSpan={showDateColumn ? 6 : 5}>
                <div className="flex items-center py-2" style={{ paddingLeft: `${depth * 20 + 48}px` }}>
                  <RefreshCw className="h-4 w-4 text-blue-500 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              </td>
            </tr>
          ) : childResources.length > 0 ? (
            // Render child resources recursively
            childResources.map(childResource => (
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
            <tr>
              <td colSpan={showDateColumn ? 6 : 5}>
                <div className="py-2 text-sm text-gray-500" style={{ paddingLeft: `${depth * 20 + 48}px` }}>
                  This folder is empty
                </div>
              </td>
            </tr>
          )}
        </>
      )}
    </>
  );
};

export default function FilePicker() {
  const { connectionId, authToken, isLoggedIn, orgId } = useAuth();

  // Root resources state
  const [expandedFolders, setExpandedFolders] = useState([]);
  const [selectedResources, setSelectedResources] = useState([]);
  const [childResourcesMap, setChildResourcesMap] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [indexingStatus, setIndexingStatus] = useState({});
  const [showDateColumn, setShowDateColumn] = useState(true);




  // Use the custom hook to fetch root resources
  const { resources, isLoading, error, mutate } = useResources(connectionId, authToken);

  // KB creation hook
  const { trigger: createKB, data: dataKB, error: errorKB, isMutating } = useCreateKnowledgeBase();

  const { trigger: sync, data: syncData, error: triggerError } = useTriggerSync(orgId, dataKB?.knowledgeBase?.knowledge_base_id);

  const { data: KBResourcesData, error: KBResourcesError, isLoading: KBResourcesIsLoading, mutate: KBResourcesMutate } = useKnowledgeBaseResources(dataKB?.knowledgeBase?.knowledge_base_id, authToken);

  const { trigger: deleteKB, isMutating: isMutatingDeleteKB, error: errorDeleteKb } = useDeleteKnowledgeBaseResource(dataKB?.knowledgeBase?.knowledge_base_id);
  // const { data: KBResourcesData, error: KBResourcesError, isLoading: KBResourcesIsLoading, mutate: KBResourcesMutate } = useKnowledgeBaseResources('58aaac70-0c25-4049-8241-358a4868a567', authToken);



  useEffect(() => {

    if (KBResourcesData && KBResourcesData?.resources?.data) {
      console.log('KBResourcesData', KBResourcesData?.resources?.data);
      // Update status to indexed
      const indexedStatus = {};
      selectedResources.forEach(id => {
        console.log('entro', KBResourcesData?.resources?.data)
        if (indexedStatus[id] !== 'Synchronized' && KBResourcesData?.resources?.data?.some(resource => resource.resource_id === id)) {
          indexedStatus[id] = 'Synchronized';
        }
      });

      setIndexingStatus(prev => ({
        ...prev,
        ...indexedStatus
      }));
    }
  }, [KBResourcesData, KBResourcesError]);

  useEffect(() => {
    if (dataKB?.knowledgeBase?.knowledge_base_id) {
      syncIndexedFiles();
    }
  }, [dataKB]);
  // Extract root resources from the response
  const rootResources = resources?.resources?.data || [];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const indexSelectedFiles = async () => {
    if (selectedResources.length === 0) return;

    try {
      // Obtener solo los IDs de archivos (no carpetas)
      const leafResourceIds = getLeafNodeResourceIds();

      if (leafResourceIds.length === 0) {
        console.warn('No files selected for indexing');
        return;
      }

      // Mark files as indexing
      const updatedStatus = {};
      selectedResources.forEach(id => {
        updatedStatus[id] = 'indexing';
      });

      setIndexingStatus(prev => ({
        ...prev,
        ...updatedStatus
      }));

      console.log('Indexing files:', leafResourceIds);
      await new Promise(resolve => setTimeout(resolve, 3000));
      // Create knowledge base using only leaf node IDs
      await createKB({
        authToken,
        body: {
          connectionId,
          connectionSourceIds: leafResourceIds,
          name: 'Knowledge Base ' + new Date().toLocaleString(),
        },
      });

      console.log('Knowledge base created:');


      // Update status to indexed
      const indexedStatus = {};
      selectedResources.forEach(id => {
        indexedStatus[id] = 'indexed';
      });

      setIndexingStatus(prev => ({
        ...prev,
        ...indexedStatus
      }));
    } catch (error) {
      console.error('Error indexing files:', error);

      // Update status to failed
      const failedStatus = {};
      selectedResources.forEach(id => {
        failedStatus[id] = 'failed';
      });

      setIndexingStatus(prev => ({
        ...prev,
        ...failedStatus
      }));
    }
  };

  const syncIndexedFiles = async () => {
    if (selectedResources.length === 0) return;

    try {

      // Mark files as indexing
      const updatedStatus = {};
      selectedResources.forEach(id => {
        if (updatedStatus[id] === 'indexed') {
          updatedStatus[id] = 'Synchronizing';
        }
      });

      setIndexingStatus(prev => ({
        ...prev,
        ...updatedStatus
      }));

      // console.log('Indexing files:', leafResourceIds);
      // await new Promise(resolve => setTimeout(resolve, 3000));
      // // Create knowledge base using only leaf node IDs
      // await createKB({
      //   authToken,
      //   body: {
      //     connectionId,
      //     connectionSourceIds: leafResourceIds,
      //     name: 'Knowledge Base ' + new Date().toLocaleString(),
      //   },
      // });

      await sync({ authToken })

      console.log('sync base created:');


      // Update status to indexed
      // const indexedStatus = {};
      // selectedResources.forEach(id => {
      //   indexedStatus[id] = 'Synchronized';
      // });

      // setIndexingStatus(prev => ({
      //   ...prev,
      //   ...indexedStatus
      // }));
    } catch (error) {
      console.error('Error indexing files:', error);

      // Update status to failed
      const failedStatus = {};
      selectedResources.forEach(id => {
        failedStatus[id] = 'failed';
      });

      setIndexingStatus(prev => ({
        ...prev,
        ...failedStatus
      }));
    }
  };

  const handleRemoveResource = async (resource: any) => {
    console.log({ resource, inode_path: resource.inode_path.path });
    const resourceId = resource.resource_id;
    try {
      // Mark as removing
      setIndexingStatus(prev => ({
        ...prev,
        [resourceId]: 'removing'
      }));

      // Call API to remove resource from index (simulated)
      // AQUI await new Promise(r => setTimeout(r, 1000));

      // Remove from selected resources
      setSelectedResources(prev => prev.filter(id => id !== resourceId));

      await deleteKB({
        resourcePath: resource.inode_path.path,
        token: authToken,
      });

      // Clear indexing status
      setIndexingStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[resourceId];
        return newStatus;
      });

      // Refresh resources
      // mutate();
    } catch (error) {
      console.error(`Error removing resource ${resourceId}:`, error);

      setIndexingStatus(prev => ({
        ...prev,
        [resourceId]: 'failed'
      }));
    }
  };

  const getLeafNodeResourceIds = () => {
    // Resultado final: IDs de recursos de último nivel
    const result: string[] = [];
    // Mantener un registro de qué IDs son padres de otros IDs seleccionados
    const parentIds = new Set();

    // Identificar todos los recursos que son padres de otros recursos seleccionados
    selectedResources.forEach(id => {
      const children = childResourcesMap[id] || [];
      children.forEach(child => {
        if (selectedResources.includes(child.resource_id)) {
          // Este recurso es padre de otro recurso seleccionado
          parentIds.add(id);
        }
      });
    });

    // Los recursos de último nivel son los seleccionados que NO son padres
    selectedResources.forEach(id => {
      if (!parentIds.has(id)) {
        result.push(id);
      }
    });

    return result;
  };

  // Filter resources by search term
  const filteredRootResources = rootResources.filter(resource => {
    const path = resource.inode_path.path.toLowerCase();
    return path.includes(searchTerm.toLowerCase());
  });

  // Sort resources
  const sortedRootResources = [...filteredRootResources].sort((a, b) => {
    // First sort by type (directories first)
    if (a.inode_type !== b.inode_type) {
      return a.inode_type === 'directory' ? -1 : 1;
    }

    // Then sort by the selected field
    let valA, valB;
    if (sortField === 'name') {
      const pathA = a.inode_path.path.split('/').filter(Boolean).pop() || '';
      const pathB = b.inode_path.path.split('/').filter(Boolean).pop() || '';
      valA = pathA.toLowerCase();
      valB = pathB.toLowerCase();
    } else if (sortField === 'status') {
      valA = a.status || '';
      valB = b.status || '';
    } else {
      valA = a[sortField] || '';
      valB = b[sortField] || '';
    }

    const comparison = valA > valB ? 1 : -1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });


  return (
    <div className="container mx-auto p-4 max-w-6xl bg-white shadow-lg rounded-lg">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">Google Drive File Picker</h1>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              // onClick={() => mutate()}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>

            <Dropdown
              trigger={
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              }
              items={[
                {
                  label: 'Show Resource ID',
                  icon: showDateColumn ? <Check className="h-4 w-4" /> : null,
                  onClick: () => setShowDateColumn(!showDateColumn)
                }
              ]}
            />
          </div>
        </div>

        {/* Search and actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-auto sm:flex-grow max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search files and folders..."
              className="pl-8 w-full"
            />
          </div>

          <div className="flex space-x-2 w-full sm:w-auto">
            <Button
              onClick={indexSelectedFiles}
              variant="primary"
              disabled={selectedResources.length === 0}
              className="flex items-center gap-1 w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4" /> Sync
            </Button>
            <Button
              onClick={indexSelectedFiles}
              variant="primary"
              disabled={selectedResources.length === 0}
              className="flex items-center gap-1 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" /> Index Selected ({selectedResources.length})
            </Button>
          </div>
        </div>

        {/* Files table */}
        <div className="border rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    {/* <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={
                        rootResources.length > 0 &&
                        rootResources.every(r => selectedResources.includes(r.resource_id))
                      }
                      onChange={toggleSelectAll}
                    /> */}
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Name
                      {sortField === 'name' && (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  {showDateColumn && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resource ID
                    </th>
                  )}
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {sortField === 'status' && (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  // Loading skeleton
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-4 w-4" />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <Skeleton className="h-5 w-5" />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      {showDateColumn && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-24" />
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-4 w-16" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Skeleton className="h-4 w-8 ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : sortedRootResources.length > 0 ? (
                  // Root resources with hierarchical children
                  sortedRootResources.map(resource => (
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
                  <tr>
                    <td colSpan={showDateColumn ? 6 : 5} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? "No matching files or folders found." : "No files or folders available."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected files indicator */}
        {selectedResources.length > 0 && (
          <div className="flex justify-between items-center bg-blue-50 p-3 rounded-md border border-blue-200">
            <span className="text-sm text-blue-800">
              {selectedResources.length} file(s) selected
            </span>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedResources([])}
              >
                Clear selection
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={indexSelectedFiles}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Index Selected
              </Button>
            </div>
          </div>
        )}
        {/* File indexing progress indicator (shown when files are being indexed) */}
        {Object.values(indexingStatus).some(status => status === 'indexing') && (
          <div className="mt-4 bg-blue-50 p-3 rounded-md border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-blue-800">Indexing files...</h3>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full w-3/4 animate-pulse"></div>
            </div>
            <p className="mt-2 text-sm text-blue-700">
              Please wait while your files are being indexed. This may take a moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}