/**
 * Types for Knowledge Base operations
 */

import { Resource } from "./stack-api";


/** 
 * Parameters for listing resources in a knowledge base
 */
export type ListKnowledgeBaseResourcesParams = {
  resourcePath: string;
};

/**
 * Parameters for deleting a resource from a knowledge base
 */
export type DeleteKnowledgeBaseResourceParams = {
  resourcePath: string;
};

/**
 * Parameters for indexing files/folders into a knowledge base
 */
export type IndexResourcesParams = {
  connectionId: string;
  connectionSourceIds: string[];
  name: string;
  description: string;
  indexingParams?: {
    ocr?: boolean;
    unstructured?: boolean;
    embeddingParams?: {
      embeddingModel?: string;
      apiKey?: string | null;
    };
    chunkerParams?: {
      chunkSize?: number;
      chunkOverlap?: number;
      chunker?: string;
    };
  };
};

/**
 * Response for knowledge base operations
 */
export type KnowledgeBaseOperationResponse = {
  success: boolean;
  message?: string;
  resourceId?: string;
  status?: string;
};

/**
 * Response for knowledge base resources listing
 */
export type KnowledgeBaseResourcesResponse = {
  resources: Resource[];
  currentPath: string;
};