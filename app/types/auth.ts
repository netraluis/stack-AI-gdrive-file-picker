/**
 * Types for authentication and API client
 */

/**
 * Auth headers used for authenticated requests
 */
export type AuthHeaders = {
  Authorization: string;
};

/**
 * API session with authentication
 */
export interface ApiSession {
  headers: AuthHeaders;
  get(url: string): Promise<any>;
  post(url: string, data: any): Promise<any>;
  delete(url: string): Promise<any>;
  
}
