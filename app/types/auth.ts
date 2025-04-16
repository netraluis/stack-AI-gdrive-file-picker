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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(url: string): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post(url: string, data: any): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete(url: string): Promise<any>;
  
}
