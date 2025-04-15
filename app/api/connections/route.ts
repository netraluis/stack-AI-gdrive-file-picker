import { createApiSession } from '@/app/lib/auth';
import { listGDriveConnections } from '@/app/lib/connections-api';
import { NextRequest, NextResponse } from 'next/server';


/**
 * Get the auth token from the request headers
 */
function getAuthToken(request: NextRequest): string | null {
  // In a real app, you might extract this from a cookie or session
  return request.headers.get('Authorization');
}

/**
 * API route to list connections
 */
export async function GET(request: NextRequest) {
  try {
    const authToken = getAuthToken(request);
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const apiClient = createApiSession({ Authorization: authToken });
    const connections = await listGDriveConnections(apiClient);
    
    return NextResponse.json(connections);
  } catch (error: any) {
    console.error('Error listing connections:', error);
    
    return NextResponse.json(
      { error: 'Failed to list connections', message: error.message },
      { status: 500 }
    );
  }
}

