import { createApiSession } from '@/app/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// URL: /api/connections/[connectionId]/resources
export async function GET(request: NextRequest) {
  try {
    const authToken = request.headers.get('Authorization');

    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Extraer connectionId de la URL
    const segments = request.nextUrl.pathname.split('/');
    const connectionId = segments[segments.indexOf('connections') + 1];

    // Obtener resourceId desde los query params
    const searchParams = request.nextUrl.searchParams;
    const resourceId = searchParams.get('resource_id');

    if (!resourceId) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      );
    }

    const apiSession = createApiSession({ Authorization: authToken });

    const url = `${process.env.API_BASE_URL || 'https://api.stack-ai.com'}/connections/${connectionId}/resources?resource_id=${encodeURIComponent(resourceId)}`;

    const response = await apiSession.get(url);


    return NextResponse.json(response);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error fetching resource:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resource', message: error.message },
      { status: 500 }
    );
  }
}