import { NextResponse } from 'next/server';
import { AIService } from '@/lib/aiService';
import { getAuthPayloadFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = getAuthPayloadFromRequest(request);
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId') ?? auth?.companyId;

    if (!companyId) {
      return NextResponse.json({ error: 'Empresa não identificada' }, { status: 400 });
    }

    const context = await AIService.fetchCompanyContext(companyId);
    return NextResponse.json({ insights: context });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}
