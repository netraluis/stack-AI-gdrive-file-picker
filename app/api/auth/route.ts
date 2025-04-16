import { getAuthHeaders, getOrgId } from '@/app/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API route for authentication with Stack AI
 * This is the equivalent of the authentication part of the Python code
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Get authentication headers (equivalent to get_auth_headers in Python)
    const authHeaders = await getAuthHeaders(email, password);
    
    // Get organization ID (equivalent to org_id = session.get(...) in Python)
    const orgId = await getOrgId(authHeaders);
    
    // Return the authentication information
    return NextResponse.json({ 
      success: true,
      authToken: authHeaders.Authorization,
      orgId
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Authentication error:', error);
    
    return NextResponse.json(
      { error: 'Authentication failed', message: error.message },
      { status: 401 }
    );
  }
}