import { createApiSession } from '@/app/lib/auth';
import { NextRequest, NextResponse } from 'next/server';


// URL: /api/knowledge-bases/[knowledgeBaseId]/resources/children
export async function GET(
  request: NextRequest,
  { params }: { params: { knowledgeBaseId: string } }
) {
  try {
    const { knowledgeBaseId } = params;
    const authToken = request.headers.get('Authorization');
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const resourcePath = searchParams.get('resource_path') || '/';
    
    const apiSession = createApiSession({ Authorization: authToken });
    
    // Get resources in the knowledge base
    const url = `${process.env.API_BASE_URL || 'https://api.stack-ai.com'}/knowledge_bases/${knowledgeBaseId}/resources/children?resource_path=${encodeURIComponent(resourcePath)}`;
    const resources = await apiSession.get(url);
    
    return NextResponse.json({
      resources,
      currentPath: resourcePath
    });
  } catch (error: any) {
    console.error('Error listing knowledge base resources:', error);
    return NextResponse.json(
      { error: 'Failed to list knowledge base resources', message: error.message },
      { status: 500 }
    );
  }
}