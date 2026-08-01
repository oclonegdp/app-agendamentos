import { NextResponse } from 'next/server';
import { AIService, MultimodalAutomationService } from '@/lib/aiService';
import { getAuthPayloadFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const expectedSecret = process.env.WEBHOOK_SECRET;
    const authHeader = request.headers.get('authorization');
    const secretHeader = request.headers.get('x-webhook-secret');
    const providedToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : secretHeader?.trim();

    if (!expectedSecret || !providedToken || providedToken !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth = getAuthPayloadFromRequest(request);

    const body = await request.json();
    const companyId = body.companyId ?? auth?.companyId;
    const clientPhone = body.clientPhone;
    const userMessage = body.message || body.userMessage;
    const messageType = body.messageType;
    const mediaUrl = body.mediaUrl;
    const textContent = body.textContent;
    const conversationHistory = Array.isArray(body.conversationHistory) ? body.conversationHistory : [];

    if (!companyId) {
      return NextResponse.json({ error: 'Empresa não identificada' }, { status: 400 });
    }

    if (!clientPhone) {
      return NextResponse.json({ error: 'Número do cliente não informado' }, { status: 400 });
    }

    let reply: string;

    if (messageType) {
      if (messageType === 'image' && !mediaUrl) {
        return NextResponse.json({ error: 'URL da mídia obrigatória para imagens' }, { status: 400 });
      }

      reply = await MultimodalAutomationService.processWebhook({
        companyId,
        clientPhone,
        messageType,
        mediaUrl,
        textContent,
      });
    } else {
      if (!userMessage) {
        return NextResponse.json({ error: 'Dados de mensagem inválidos' }, { status: 400 });
      }

      reply = await AIService.processMessage({
        companyId,
        clientPhone,
        userMessage,
        conversationHistory,
      });
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'automation', provider: 'groq' });
}
