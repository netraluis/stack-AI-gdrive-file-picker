import { createApiSession } from '@/app/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

type Params = {
  params: {
    knowledgeBaseId: string;
    orgId: string;
  };
};

// URL: /api/knowledge-bases/sync/trigger/[knowledgeBaseId]/[orgId]
export async function GET(
  request: NextRequest,
  { params }: Params
) {

  try {
    const { knowledgeBaseId, orgId } =  params;
    const authToken = request.headers.get('Authorization');
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const apiSession = createApiSession({ Authorization: authToken });
    
    // Trigger the knowledge base synchronization
    const url = `${process.env.API_BASE_URL || 'https://api.stack-ai.com'}/knowledge_bases/sync/trigger/${knowledgeBaseId}/${orgId}`;
    const result = await apiSession.get(url);
    
    return NextResponse.json({
      success: true,
      result,
      message: 'Knowledge base sync has been triggered'
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error triggering knowledge base sync:', error);
    return NextResponse.json(
      { error: 'Failed to trigger knowledge base sync', message: error.message },
      { status: 500 }
    );
  }
}