import { createApiSession } from '@/app/lib/auth';
import { NextRequest, NextResponse } from 'next/server';


type Params = {
  params: {
    knowledgeBaseId: string;
  };
};
// URL: /api/knowledge-bases/[knowledgeBaseId]/resources
export async function DELETE(
  request: NextRequest,
  { params }: Params 
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
    
    const searchParams = request.nextUrl.searchParams;
    const resourcePath = searchParams.get('resource_path');
    
    if (!resourcePath) {
      return NextResponse.json(
        { error: 'Resource path is required' },
        { status: 400 }
      );
    }
    
    const apiSession = createApiSession({ Authorization: authToken });
    // Delete the resource from the knowledge base
    const url = `${process.env.API_BASE_URL || 'https://api.stack-ai.com'}/knowledge_bases/${knowledgeBaseId}/resources?resource_path=${encodeURIComponent(resourcePath)}`;
    await apiSession.delete(url);
    
    return NextResponse.json({
      success: true,
      message: `Resource '${resourcePath}' has been removed from the knowledge base`
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error deleting knowledge base resource:', error);
    return NextResponse.json(
      { error: 'Failed to delete knowledge base resource', message: error.message },
      { status: 500 }
    );
  }
}