/**
 * Types for Stack AI API
 */

/**
 * Connection object from Stack AI API
 */
export type Connection = {
    connection_id: string;
    name: string;
    created_at: string;
    updated_at: string;
    connection_provider: string;
    connection_provider_data?: any;
  };
  
  /**
   * Resource (file or folder) in a connection
   */
  export type Resource = {
    resource_id: string;
    inode_type: 'file' | 'directory';
    inode_path: {
      path: string;
    };
    status?: string;
    created_at?: string;
    updated_at?: string;
  };

   /**
   * Resource (file or folder) in a connection api response
   */

  export type ResourceResponse = {
    resources: {data: Resource[]};
    parentId?: string;
  };

  /**
   * Knowledge Base object
   */
  export type KnowledgeBase = {
    knowledge_base_id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    connection_id: string;
    org_id: string;
  };