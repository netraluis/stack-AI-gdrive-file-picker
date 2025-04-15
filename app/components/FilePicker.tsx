'use client';
import React, { useState, useEffect } from 'react';
import { Folder, File, ChevronRight, ChevronDown, Search, ArrowUp, Trash2, Check, RefreshCw, Plus, ArrowUpDown, Calendar, SortAsc, SortDesc, Filter, Tag } from 'lucide-react';
import { useAuth } from '../context/authContext';
import { useResources } from '../hooks/useResources';
import { useCreateKnowledgeBase } from '../hooks/useKnowledgeBase';

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

export default function FilePicker() {
  const { connectionId, authToken, isLoggedIn } = useAuth();
  

  // const [resources, setResources] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState(undefined);
  const [breadcrumbPath, setBreadcrumbPath] = useState([{ id: null, name: 'Root' }]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [indexingStatus, setIndexingStatus] = useState({});
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [showDateColumn, setShowDateColumn] = useState(true);
  const [fileTypeFilter, setFileTypeFilter] = useState('all'); // 'all', 'documents', 'images', etc.
  
  const {setResources, resources, isLoading, error, mutate } = useResources(connectionId, authToken, currentFolder);

  const { trigger: createKB, data, error: errorKB, isMutating } = useCreateKnowledgeBase();

  const handleKBHandler = async () => {
    console.log({connectionId, selectedFiles, authToken})
    const result = await createKB({
      authToken,
      body: {
        connectionId,
        connectionSourceIds: selectedFiles,
        name: 'Nueva KB',
      },
    });

  }


  const fetchResources = () => mutate(); // revalida los datos desde SWR

  const handleFolderClick = (resource) => {
    setCurrentFolder(resource.resource_id);
    
    // Update breadcrumb
    const pathParts = resource.inode_path.path.split('/').filter(Boolean);
    const newPath = [...breadcrumbPath];
    
    // If we're not already deeper in the path
    if (breadcrumbPath.findIndex(item => item.id === resource.resource_id) === -1) {
      newPath.push({ 
        id: resource.resource_id, 
        name: pathParts[pathParts.length - 1] 
      });
    }
    
    setBreadcrumbPath(newPath);
  };

  const handleBreadcrumbClick = (item, index) => {
    setCurrentFolder(item.id);
    setBreadcrumbPath(breadcrumbPath.slice(0, index + 1));
  };

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleFileSelection = (resource: any) => {

    const partentId = resources?.parentId
    console.log({partentId, selectedFiles, resource})

    const resourceId = resource.resource_id;
    if(partentId && selectedFiles.includes(partentId)){
      const newSelectedFiles = selectedFiles.filter(id => id !== partentId);
      return setSelectedFiles([...newSelectedFiles, resourceId ]);
    }

    if(selectedFiles.includes(resourceId)){
      const newSelectedFiles = selectedFiles.filter(id => id !== resourceId);
      return setSelectedFiles(newSelectedFiles);
    }

    setSelectedFiles(prev => ([
      ...prev,
      resourceId
    ]));
  };

  const indexSelectedFiles = async () => {
    const selectedResourceIds = selectedFiles
  
    console.log({resources})
    for (const resourceId of selectedResourceIds) {
      try {
        // await api.indexResource(resourceId);

        console.log({ selectedResourceIds, resources: resources?.resources?.data})

        if(!resources) return;
        
        // Update resources status
        setResources({parentId: resources?.parentId, resources: {data: resources.resources.data.map((resource) => 
          resource.resource_id === resourceId 
            ? { ...resource, status: 'indexing' } 
            : resource
        )}});

        // await handleKBHandler()


        setResources({parentId: resources?.parentId, resources: {data: resources.resources.data.map((resource) => 
          resource.resource_id === resourceId 
            ? { ...resource, status: 'indexed' } 
            : resource
        )}});

        
      } catch (error) {
        console.error(`Failed to index resource ${resourceId}:`, error);
        // Update indexing status to failed
        setIndexingStatus(prev => ({
          ...prev,
          [resourceId]: 'failed'
        }));
      }
    }
  };

  const removeResource = async (resourceId) => {
    try {
      // Show removing status
      setIndexingStatus(prev => ({
        ...prev,
        [resourceId]: 'removing'
      }));
      
      await api.deleteResource(resourceId);
      
      // Update local state to remove the indexed status
      setResources(resources.map(resource => 
        resource.resource_id === resourceId 
          ? { ...resource, status: undefined } 
          : resource
      ));
      
      // Update selected files state
      // setSelectedFiles(prev => ({
      //   ...prev,
      //   [resourceId]: false
      // }));

      setSelectedFiles(prev => (prev.filter(id => id !== resourceId)));
      
      // Clear indexing status
      setIndexingStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[resourceId];
        return newStatus;
      });
    } catch (error) {
      console.error(`Failed to remove resource ${resourceId}:`, error);
      setIndexingStatus(prev => ({
        ...prev,
        [resourceId]: 'failed'
      }));
    }
  };

  // Helper function to get file type from path
  const getFileType = (path) => {
    const extension = path.split('.').pop().toLowerCase();
    const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx'];
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
    
    if (documentTypes.includes(extension)) return 'document';
    if (imageTypes.includes(extension)) return 'image';
    return 'other';
  };

  // Filter resources based on search term and file type filter
  const filteredResources = resources?.resources ? resources?.resources.data.filter(resource => {
    const path = resource.inode_path.path.toLowerCase();
    const matchesSearch = path.includes(searchTerm.toLowerCase());
    
    // Always show directories regardless of file type filter
    if (resource.inode_type === 'directory') return matchesSearch;
    
    // Apply file type filter for files
    if (fileTypeFilter === 'all') return matchesSearch;
    
    const fileType = getFileType(path);
    return matchesSearch && fileTypeFilter === fileType;
  }): [];

  // Sort resources
  const sortedResources = [...filteredResources].sort((a, b) => {
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
    } else if (sortField === 'date') {
      valA = a.last_modified || '';
      valB = b.last_modified || '';
    } else {
      // Add other sort fields here if needed
      valA = a[sortField];
      valB = b[sortField];
    }
    
    const comparison = valA > valB ? 1 : -1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const getStatusBadge = (resource) => {
    // First check the processing status
    if (indexingStatus[resource.resource_id]) {
      const status = indexingStatus[resource.resource_id];
      
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
    
    // Then check the resource's status
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

  const getFileName = (path) => {
    return path.split('/').filter(Boolean).pop() || '';
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Select/deselect all files in current view
  const toggleSelectAll = () => {
    const allSelected = filteredResources.every(resource => 
      selectedFiles[resource.resource_id]
    );
    
    const updatedSelection = { ...selectedFiles };
    
    filteredResources.forEach(resource => {
      updatedSelection[resource.resource_id] = !allSelected;
    });
    
    setSelectedFiles(updatedSelection);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl bg-white shadow-lg rounded-lg">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">Google Drive File Picker</h1>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchResources}
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
                  label: 'All Files', 
                  icon: <Tag className="h-4 w-4" />,
                  onClick: () => setFileTypeFilter('all') 
                },
                { 
                  label: 'Documents', 
                  icon: <File className="h-4 w-4" />,
                  onClick: () => setFileTypeFilter('document') 
                },
                { 
                  label: 'Images', 
                  icon: <File className="h-4 w-4" />,
                  onClick: () => setFileTypeFilter('image') 
                },
                { 
                  label: 'Show Date', 
                  icon: showDateColumn ? <Check className="h-4 w-4" /> : null,
                  onClick: () => setShowDateColumn(!showDateColumn) 
                }
              ]}
            />
          </div>
        </div>
        
        {/* Breadcrumb navigation */}
        <div className="flex items-center text-sm text-gray-600 py-2 bg-gray-50 rounded px-3 overflow-x-auto">
          {breadcrumbPath.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="h-4 w-4 mx-1 text-gray-400 flex-shrink-0" />}
              <span 
                className={`${index < breadcrumbPath.length - 1 ? 'hover:text-blue-600 cursor-pointer' : 'font-medium text-blue-600'} whitespace-nowrap`}
                onClick={() => index < breadcrumbPath.length - 1 && handleBreadcrumbClick(item, index)}
              >
                {item.name}
              </span>
            </React.Fragment>
          ))}
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
              className="flex items-center gap-1 w-full sm:w-auto"
              // disabled={!Object.keys(selectedFiles).some(id => selectedFiles[id] && isLoading && !resources.find(r => r.resource_id === id)?.status)}
            >
              <RefreshCw className="h-4 w-4" /> Sync
            </Button>
            <Button 
              onClick={indexSelectedFiles}
              variant="primary"
              className="flex items-center gap-1 w-full sm:w-auto"
              // disabled={!Object.keys(selectedFiles).some(id => selectedFiles[id] && isLoading && !resources.find(r => r.resource_id === id)?.status)}
            >
              <Plus className="h-4 w-4" /> Index Selected
            </Button>
          </div>
        </div>
        
        {/* Sort controls */}
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-500">
            <span>Sort by:</span>
            <button 
              className={`ml-2 flex items-center px-2 py-1 rounded ${sortField === 'name' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
              onClick={() => handleSort('name')}
            >
              Name
              {sortField === 'name' && (
                sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
              )}
            </button>
            <button 
              className={`ml-2 flex items-center px-2 py-1 rounded ${sortField === 'status' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
              onClick={() => handleSort('status')}
            >
              Status
              {sortField === 'status' && (
                sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
              )}
            </button>
            <button 
              className={`ml-2 flex items-center px-2 py-1 rounded ${sortField === 'date' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
              onClick={() => handleSort('date')}
            >
              Date
              {sortField === 'date' && (
                sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
              )}
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            {filteredResources.length} items
          </div>
        </div>
        
        {/* Files table */}
        <div className="border rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={filteredResources.length > 0 && filteredResources.every(resource => selectedFiles[resource.resource_id])}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    Type
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Name
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  {showDateColumn && (
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center">
                        Resource_id
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </th>
                  )}
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  // Loading skeletons
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-4 w-4" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-4 w-4" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                        <Skeleton className="h-4 w-16 ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : sortedResources.length > 0 ? (
                  sortedResources.map((resource) => {
                    const isFolder = resource.inode_type === 'directory';
                    const fileName = getFileName(resource.inode_path.path);
                    const isIndexed = resource.status === 'indexed';
                    const isPending = resource.status === 'pending' || indexingStatus[resource.resource_id] === 'indexing';
                    const isRemoving = indexingStatus[resource.resource_id] === 'removing';
                    
                    return (
                      <tr key={resource.resource_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={selectedFiles.includes(resource.resource_id)}
                            onChange={() => toggleFileSelection(resource)}
                            disabled={isRemoving}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isFolder ? (
                            <Folder className="h-5 w-5 text-blue-500" />
                          ) : (
                            <File className="h-5 w-5 text-gray-500" />
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div 
                            className={`${isFolder ? "cursor-pointer text-blue-600 font-medium hover:underline" : "text-gray-800"}`}
                            onClick={() => isFolder && handleFolderClick(resource)}
                          >
                            {fileName}
                          </div>
                        </td>
                        {showDateColumn && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {resource.resource_id}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(resource)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {/* {!isIndexed && !isPending && !isRemoving && (
                              <Tooltip content="Add to index">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    toggleFileSelection(resource.resource_id);
                                    // Set selected to true (for immediate UI feedback)
                                    setSelectedFiles(prev => ([
                                      ...prev,
                                      resource.resource_id
                                    ]));
                                  }}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </Tooltip>
                            )} */}
                            
                            {isIndexed && !isRemoving && (
                              <Tooltip content="Remove from index">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeResource(resource)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={showDateColumn ? 6 : 5} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? "No matching files or folders found." : 
                       fileTypeFilter !== 'all' ? "No matching files of the selected type." : 
                       "This folder is empty."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Selected files indicator */}
        {Object.values(selectedFiles).some(Boolean) && (
          <div className="flex justify-between items-center bg-blue-50 p-3 rounded-md border border-blue-200">
            <span className="text-sm text-blue-800">
              {selectedFiles.length} file(s) selected
            </span>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedFiles([])}
                className="flex items-center gap-1"
              >
                Clear selection
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={indexSelectedFiles}
                // disabled={!Object.keys(selectedFiles).some(id => selectedFiles[id] && isLoading  && !resources.find(r => r.resource_id === id)?.status)}
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