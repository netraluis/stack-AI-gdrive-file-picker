/**
 * Authentication utilities for Stack AI API
 */

import { ApiSession, AuthHeaders } from "../types/auth";


const SUPABASE_AUTH_URL = "https://sb.stack-ai.com";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZic3VhZGZxaGtseG9rbWxodHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM0NTg5ODAsImV4cCI6MTk4OTAzNDk4MH0.Xjry9m7oc42_MsLRc1bZhTTzip3srDjJ6fJMkwhXQ9s";
const BACKEND_URL = "https://api.stack-ai.com";

/**
 * Get authentication headers for the Stack AI API
 * Equivalent to get_auth_headers in the Python code
 */
export async function getAuthHeaders(email: string, password: string): Promise<AuthHeaders> {
  const requestUrl = `${SUPABASE_AUTH_URL}/auth/v1/token?grant_type=password`;
  
  const response = await fetch(requestUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Apikey': ANON_KEY,
    },
    body: JSON.stringify({
      email,
      password,
      gotrue_meta_security: {},
    }),
  });

  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const accessToken = data.access_token;

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

/**
 * Get the organization ID of the current user
 * Equivalent to getting org_id in the Python code
 */
export async function getOrgId(authHeaders: AuthHeaders): Promise<string> {
  const response = await fetch(`${BACKEND_URL}/organizations/me/current`, {
    headers: authHeaders,
  });

  if (!response.ok) {
    throw new Error(`Failed to get organization ID: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.org_id;
}

/**
 * Create a session with authentication headers
 * Equivalent to session = requests.Session() in the Python code
 */
export function createApiSession(authHeaders: AuthHeaders): ApiSession {
  return {
    headers: authHeaders,
    
    /**
     * Make a GET request with authentication
     */
    async get(url: string): Promise<any> {
      const response = await fetch(url, {
        headers: this.headers,
      });
      
      if (!response.ok) {
        throw new Error(`API GET request failed: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    },
    
    /**
     * Make a POST request with authentication
     */
    async post(url: string, data: any): Promise<any> {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...this.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`API POST request failed: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    },
    
    /**
     * Make a DELETE request with authentication
     */
    async delete(url: string): Promise<any> {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.headers,
      });
      
      if (!response.ok) {
        throw new Error(`API DELETE request failed: ${response.status} ${response.statusText}`);
      }
      
      // return response.json();
      // Assuming the DELETE request returns a success message because it gives me an error if I try to parse it
      return 
    }
  };
}