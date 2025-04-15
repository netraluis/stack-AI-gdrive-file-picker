import { ApiSession } from "../types/auth";

export type InodePath = {
  path: string;
};

export type Resource = {
  resource_id: string;
  inode_type: "file" | "directory";
  inode_path: InodePath;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

export type Connection = {
  connection_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  connection_provider: string;
  connection_provider_data?: any;
};

/**
 * List Google Drive connections for the current user
 * @param apiClient Authentication API client
 * @returns List of connections
 */
export async function listGDriveConnections(apiClient: ApiSession): Promise<Connection[]> {
  const url = `${"https://api.stack-ai.com"}/connections?connection_provider=gdrive&limit=1`;
  return apiClient.get(url);
}

/**
 * Get root resources for a connection
 * @param apiClient Authentication API client
 * @param connectionId The connection ID
 * @returns List of root resources
 */
export async function getRootResources(apiClient: ApiSession, connectionId: string): Promise<Resource[]> {
  const url = `${"https://api.stack-ai.com"}/connections/${connectionId}/resources/children`;
  return apiClient.get(url);
}

/**
 * Get resources for a specific directory in a connection
 * @param apiClient Authentication API client
 * @param connectionId The connection ID
 * @param resourceId The resource ID of the directory
 * @returns List of resources in the directory
 */
export async function getDirectoryResources(
  apiClient: ApiSession, 
  connectionId: string, 
  resourceId: string
): Promise<Resource[]> {
  const url = `${"https://api.stack-ai.com"}/connections/${connectionId}/resources/children?resource_id=${encodeURIComponent(resourceId)}`;
  return apiClient.get(url);
}

/**
 * Get information about a specific resource
 * @param apiClient Authentication API client
 * @param connectionId The connection ID
 * @param resourceId The resource ID
 * @returns Resource information
 */
export async function getResourceInfo(
  apiClient: ApiSession, 
  connectionId: string, 
  resourceId: string
): Promise<Resource> {
  const url = `${"https://api.stack-ai.com"}/connections/${connectionId}/resources?resource_id=${encodeURIComponent(resourceId)}`;
  return apiClient.get(url);
}