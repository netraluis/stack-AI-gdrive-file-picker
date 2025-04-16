import { createApiSession } from '@/app/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// URL: /api/connections/[connectionId]/resources/children
export async function GET(request: NextRequest) {
  try {
    const authToken = request.headers.get('Authorization');

    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const segments = request.nextUrl.pathname.split('/');
    const connectionId = segments[segments.indexOf('connections') + 1];

    const searchParams = request.nextUrl.searchParams;
    const resourceId = searchParams.get('resource_id');

    const apiSession = createApiSession({ Authorization: authToken });

    const baseUrl = `${process.env.API_BASE_URL || 'https://api.stack-ai.com'}/connections/${connectionId}/resources/children`;
    const url = resourceId
      ? `${baseUrl}?resource_id=${encodeURIComponent(resourceId)}`
      : baseUrl;

    const resources = await apiSession.get(url);

    return NextResponse.json({
      resources,
      parentId: resourceId || 'root'
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error listing resources:', error);
    return NextResponse.json(
      { error: 'Failed to list resources', message: error.message },
      { status: 500 }
    );
  }
}
