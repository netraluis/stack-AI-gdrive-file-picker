import { createApiSession } from '@/app/lib/auth';
import { NextRequest, NextResponse } from 'next/server';


// URL: /api/connections/[connectionId]/resources
export async function GET(
  request: NextRequest,
  { params }: { params: { connectionId: string } }
) {
  try {
    const { connectionId } = await params;
    const authToken = request.headers.get('Authorization');
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const resourceId = searchParams.get('resource_id');
    
    if (!resourceId) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      );
    }
    
    const apiSession = createApiSession({ Authorization: authToken });

    console.log('API Session:', `${process.env.API_BASE_URL || 'https://api.stack-ai.com'}/connections/${connectionId}/resources?resource_id=${encodeURIComponent(resourceId)}`);
    
    // Get details for a specific resource
    const url = `${process.env.API_BASE_URL || 'https://api.stack-ai.com'}/connections/${connectionId}/resources?resource_id=${encodeURIComponent(resourceId)}`;
    const response = await apiSession.get(url);

    console.log('Response:', response);
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching resource:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resource', message: error.message },
      { status: 500 }
    );
  }
}