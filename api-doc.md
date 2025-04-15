# Stack AI File Picker API Documentation

This document provides detailed information about the API endpoints used in the Stack AI File Picker application.

## Base URL

All API routes are relative to your application's base URL. For local development, this is typically:

```
http://localhost:3000
```

## Authentication

### Login

```
POST /api/auth
```

Authenticates a user with Stack AI and returns an authentication token and organization ID.

**Request Body:**
```json
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "authToken": "Bearer token_value",
  "orgId": "organization_id"
}
```

**Error Response:**
```json
{
  "error": "Authentication failed",
  "message": "Invalid credentials"
}
```

## Connections

### List Connections

```
GET /api/connections
```

Lists all Google Drive connections for the current user.

**Headers:**
- `Authorization`: Bearer token from authentication

**Response:**
```json
[
  {
    "connection_id": "connection_id",
    "name": "Google Drive Connection",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z",
    "connection_provider": "gdrive"
  }
]
```

**Error Response:**
```json
{
  "error": "Failed to list connections",
  "message": "Error details"
}
```

## Resources

### Get Resource Details

```
GET /api/connections/{connectionId}/resources?resource_id={resourceId}
```

Gets details about a specific resource (file or folder).

**Headers:**
- `Authorization`: Bearer token from authentication

**Path Parameters:**
- `connectionId`: ID of the connection

**Query Parameters:**
- `resource_id`: ID of the resource to get details for

**Response:**
```json
{
  "resource_id": "resource_id",
  "inode_type": "file",
  "inode_path": {
    "path": "/path/to/file.txt"
  }
}
```

**Error Response:**
```json
{
  "error": "Failed to fetch resource",
  "message": "Error details"
}
```

### List Resources in Directory

```
GET /api/connections/{connectionId}/resources/children
```

Lists all resources in the root directory.

```
GET /api/connections/{connectionId}/resources/children?resource_id={folderId}
```

Lists all resources in a specific folder.

**Headers:**
- `Authorization`: Bearer token from authentication

**Path Parameters:**
- `connectionId`: ID of the connection

**Query Parameters:**
- `resource_id` (optional): ID of the folder to list contents of. If not provided, lists root level resources.

**Response:**
```json
{
  "resources": [
    {
      "resource_id": "resource_id_1",
      "inode_type": "directory",
      "inode_path": {
        "path": "/folder"
      }
    },
    {
      "resource_id": "resource_id_2",
      "inode_type": "file",
      "inode_path": {
        "path": "/file.txt"
      }
    }
  ],
  "parentId": "folder_id_or_root"
}
```

**Error Response:**
```json
{
  "error": "Failed to list resources",
  "message": "Error details"
}
```

## Knowledge Bases

### Create Knowledge Base

```
POST /api/knowledge-bases
```

Creates a new knowledge base with selected files and folders.

**Headers:**
- `Authorization`: Bearer token from authentication

**Request Body:**
```json
{
  "connectionId": "connection_id",
  "connectionSourceIds": ["resource_id_1", "resource_id_2"],
  "name": "My Knowledge Base",
  "description": "Description of my knowledge base",
  "indexingParams": {
    "ocr": false,
    "unstructured": true,
    "embeddingParams": {
      "embeddingModel": "text-embedding-ada-002",
      "apiKey": null
    },
    "chunkerParams": {
      "chunkSize": 1500,
      "chunkOverlap": 500,
      "chunker": "sentence"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "knowledgeBase": {
    "knowledge_base_id": "kb_id",
    "name": "My Knowledge Base",
    "description": "Description of my knowledge base",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z",
    "connection_id": "connection_id",
    "org_id": "org_id"
  },
  "message": "Knowledge base created successfully"
}
```

**Error Response:**
```json
{
  "error": "Failed to create knowledge base",
  "message": "Error details"
}
```

### Trigger Knowledge Base Sync

```
GET /api/knowledge-bases/sync/trigger/{knowledgeBaseId}/{orgId}
```

Triggers synchronization of a knowledge base.

**Headers:**
- `Authorization`: Bearer token from authentication

**Path Parameters:**
- `knowledgeBaseId`: ID of the knowledge base
- `orgId`: Organization ID

**Response:**
```json
{
  "success": true,
  "result": {
    // Sync result details
  },
  "message": "Knowledge base sync has been triggered"
}
```

**Error Response:**
```json
{
  "error": "Failed to trigger knowledge base sync",
  "message": "Error details"
}
```

### List Knowledge Base Resources

```
GET /api/knowledge-bases/{knowledgeBaseId}/resources/children?resource_path={path}
```

Lists resources in a knowledge base at a specific path.

**Headers:**
- `Authorization`: Bearer token from authentication

**Path Parameters:**
- `knowledgeBaseId`: ID of the knowledge base

**Query Parameters:**
- `resource_path`: Path in the knowledge base to list resources from (defaults to "/")

**Response:**
```json
{
  "resources": [
    {
      "resource_id": "resource_id_1",
      "inode_type": "directory",
      "inode_path": {
        "path": "/folder"
      },
      "status": "indexed"
    },
    {
      "resource_id": "resource_id_2",
      "inode_type": "file",
      "inode_path": {
        "path": "/file.txt"
      },
      "status": "indexed"
    }
  ],
  "currentPath": "/path"
}
```

**Error Response:**
```json
{
  "error": "Failed to list knowledge base resources",
  "message": "Error details"
}
```

### Delete Knowledge Base Resource

```
DELETE /api/knowledge-bases/{knowledgeBaseId}/resources?resource_path={path}
```

Removes a resource from the knowledge base (de-indexes it without deleting from Google Drive).

**Headers:**
- `Authorization`: Bearer token from authentication

**Path Parameters:**
- `knowledgeBaseId`: ID of the knowledge base

**Query Parameters:**
- `resource_path`: Path of the resource to remove

**Response:**
```json
{
  "success": true,
  "message": "Resource '/path/to/file.txt' has been removed from the knowledge base"
}
```

**Error Response:**
```json
{
  "error": "Failed to delete knowledge base resource",
  "message": "Error details"
}
```

## Status Codes

- `200 OK`: The request succeeded
- `400 Bad Request`: The server could not understand the request (missing parameters, invalid format)
- `401 Unauthorized`: Authentication is required or failed
- `403 Forbidden`: The authenticated user does not have permission
- `404 Not Found`: The requested resource was not found
- `500 Internal Server Error`: An error occurred on the server

## Resource Status Values

Resources in a knowledge base can have the following status values:

- `pending`: The resource is waiting to be indexed
- `indexing`: The resource is currently being indexed
- `indexed`: The resource has been successfully indexed
- `failed`: The indexing process failed for this resource

## Authentication Flow

1. Call `/api/auth` with email and password to get `authToken` and `orgId`
2. Include the `authToken` in the Authorization header for all subsequent requests
3. Use the `orgId` when needed for specific endpoints like the sync trigger

## File Picker Workflow

1. List connections to get the `connectionId`
2. Browse files using the connection resources endpoints 
3. Select files/folders to index
4. Create a knowledge base with the selected resources
5. Trigger the sync to start indexing
6. Monitor the knowledge base resources to see indexing status
7. Optionally remove resources from the knowledge base as needed
