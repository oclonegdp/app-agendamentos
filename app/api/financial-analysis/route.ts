import { NextResponse } from 'next/server';
import { MultimodalFinancialEngine } from '@/services/multimodalEngine';
import { getAuthPayloadFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const auth = getAuthPayloadFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl, audioTranscription } = body;
    if (!imageUrl && !audioTranscription) {
      return NextResponse.json({ error: 'É necessário fornecer imageUrl ou audioTranscription.' }, { status: 400 });
    }

    const result = await MultimodalFinancialEngine.processOperationMedia({
      companyId: auth.companyId || '',
      imageUrl,
      audioTranscription,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}
