/**
 * Authentication utilities for Stack AI API
 */

import { ApiSession, AuthHeaders } from "../types/auth";


/**
 * Get authentication headers for the Stack AI API
 * Equivalent to get_auth_headers in the Python code
 */
export async function getAuthHeaders(email: string, password: string): Promise<AuthHeaders> {
  const requestUrl = `${process.env.SUPABASE_AUTH_URL}/auth/v1/token?grant_type=password`;
  
  const response = await fetch(requestUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Apikey': process.env.ANON_KEY!,
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
  const response = await fetch(`${process.env.BACKEND_URL}/organizations/me/current`, {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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