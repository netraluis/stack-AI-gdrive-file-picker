import { Resource } from './stackApi'

export enum ResourceState {
  INDEXING = "indexing",
  REMOVING = "removing",
  INDEXED = "indexed",
  FAILED = "failed",
  SYNCHRONIZED = "synchronized",
  SYNCRONIZING = "synchronizing",
  RESOURCE = "resource",
}

export interface ResourceStatusMap {
  [resourceId: string]: ResourceState;
}

export interface ResourceChildrenMap {
  [resourceId: string]: Resource[];
}