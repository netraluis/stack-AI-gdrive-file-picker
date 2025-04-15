import { createApiSession } from '@/app/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// URL: /api/connections/[connectionId]/resources/children
export async function GET(
  request: NextRequest,
  { params }: { params: { connectionId: string } }
) {
  try {
    const { connectionId } = params;
    const authToken = request.headers.get('Authorization');
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const resourceId = searchParams.get('resource_id'); // ID of the folder to list
    
    const apiSession = createApiSession({ Authorization: authToken });
    
    // Build the URL based on whether we're listing resources in a folder or at the root
    const baseUrl = `${process.env.API_BASE_URL || 'https://api.stack-ai.com'}/connections/${connectionId}/resources/children`;
    const url = resourceId 
      ? `${baseUrl}?resource_id=${encodeURIComponent(resourceId)}`
      : baseUrl;
    
    const resources = await apiSession.get(url);

    // Test purpose
    // console.log('Resources:', resources);
    // for (const resource of resources.data) {
    //   // Convert the resource ID to a string if it's a number
    //   console.log('API Session:', resource, `${process.env.API_BASE_URL || 'https://api.stack-ai.com'}/connections/${connectionId}/resources?resource_id=${encodeURIComponent(resource.resource_id)}`);
    //   const url = `${process.env.API_BASE_URL || 'https://api.stack-ai.com'}/connections/${connectionId}/resources?resource_id=${encodeURIComponent(resource.resource_id)}`;
    //   const response = await apiSession.get(url);
    //   console.log('Response:', response);
    // }
    // Test purpose


    return NextResponse.json({ 
      resources,
      parentId: resourceId || 'root'
    });
  } catch (error: any) {
    console.error('Error listing resources:', error);
    return NextResponse.json(
      { error: 'Failed to list resources', message: error.message },
      { status: 500 }
    );
  }
}