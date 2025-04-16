import { createApiSession } from '@/app/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// URL: /api/knowledge-bases/[knowledgeBaseId]/resources/children
export async function GET(request: NextRequest) {
  try {
    const authToken = request.headers.get('Authorization');

    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Extraer knowledgeBaseId de la ruta
    const segments = request.nextUrl.pathname.split('/');
    const knowledgeBaseId = segments[segments.indexOf('knowledge-bases') + 1];

    // Query param opcional
    const searchParams = request.nextUrl.searchParams;
    const resourcePath = searchParams.get('resource_path') || '/';

    const apiSession = createApiSession({ Authorization: authToken });

    const url = `${process.env.API_BASE_URL || 'https://api.stack-ai.com'}/knowledge_bases/${knowledgeBaseId}/resources/children?resource_path=${encodeURIComponent(resourcePath)}`;

    const resources = await apiSession.get(url);

    return NextResponse.json({
      resources,
      currentPath: resourcePath
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error listing knowledge base resources:', error);
    return NextResponse.json(
      {
        error: 'Failed to list knowledge base resources',
        message: error.message
      },
      { status: 500 }
    );
  }
}
