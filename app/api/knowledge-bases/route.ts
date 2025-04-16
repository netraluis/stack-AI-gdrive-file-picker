import { createApiSession } from '@/app/lib/auth';
import { IndexResourcesParams } from '@/app/types/knowledgeBase';
import { NextRequest, NextResponse } from 'next/server';

// URL: /api/knowledge-bases
export async function POST(request: NextRequest) {
  try {
    const authToken = request.headers.get('Authorization');
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body: IndexResourcesParams = await request.json();
    const { connectionId, connectionSourceIds, name, description, indexingParams } = body;
    
    // Validate required fields
    if (!connectionId || !connectionSourceIds || !name) {
      return NextResponse.json(
        { error: 'Required fields missing: connectionId, connectionSourceIds, name' },
        { status: 400 }
      );
    }
    
    const apiSession = createApiSession({ Authorization: authToken });
    
    // Create the knowledge base
    const createUrl = `${process.env.API_BASE_URL || 'https://api.stack-ai.com'}/knowledge_bases`;
    
    // Default indexing parameters if not provided
    const defaultIndexingParams = {
      ocr: false,
      unstructured: true,
      embedding_params: {
        embedding_model: "text-embedding-ada-002",
        api_key: null
      },
      chunker_params: {
        chunk_size: 1500,
        chunk_overlap: 500,
        chunker: "sentence"
      }
    };
    
    // Prepare the payload with default parameters if needed
    const payload = {
      connection_id: connectionId,
      connection_source_ids: connectionSourceIds,
      name,
      description: description || `Knowledge base for selected resources`,
      indexing_params: indexingParams ? {
        ocr: indexingParams.ocr ?? defaultIndexingParams.ocr,
        unstructured: indexingParams.unstructured ?? defaultIndexingParams.unstructured,
        embedding_params: {
          embedding_model: indexingParams.embeddingParams?.embeddingModel ?? defaultIndexingParams.embedding_params.embedding_model,
          api_key: indexingParams.embeddingParams?.apiKey ?? defaultIndexingParams.embedding_params.api_key
        },
        chunker_params: {
          chunk_size: indexingParams.chunkerParams?.chunkSize ?? defaultIndexingParams.chunker_params.chunk_size,
          chunk_overlap: indexingParams.chunkerParams?.chunkOverlap ?? defaultIndexingParams.chunker_params.chunk_overlap,
          chunker: indexingParams.chunkerParams?.chunker ?? defaultIndexingParams.chunker_params.chunker
        }
      } : defaultIndexingParams,
      org_level_role: null,
      cron_job_id: null
    };
    
    const knowledgeBase = await apiSession.post(createUrl, payload);
    
    return NextResponse.json({
      success: true,
      knowledgeBase,
      message: 'Knowledge base created successfully'
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error creating knowledge base:', error);
    return NextResponse.json(
      { error: 'Failed to create knowledge base', message: error.message },
      { status: 500 }
    );
  }
}