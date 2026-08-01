import { Groq } from 'groq-sdk';
import { prisma } from '@/lib/prisma';
import { AppointmentSecurityService, type BlockedException } from '@/lib/appointmentSecurityService';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ProcessClientMessageParams {
  companyId: string;
  clientPhone: string;
  userMessage: string;
  conversationHistory?: AIChatMessage[];
}

export class AIService {
  private static async fetchCompanyContext(companyId: string): Promise<string> {
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        include: {
          services: {
            select: { name: true, price: true, duration: true },
            orderBy: { name: 'asc' },
          },
          appointments: {
            where: { date: { gte: new Date() }, companyId },
            take: 10,
            orderBy: { date: 'asc' },
            include: {
              client: { select: { name: true } },
              service: { select: { name: true } },
            },
          },
        },
      });

      if (!company) {
        return 'Estabelecimento não encontrado.';
      }

      const servicesList = company.services
        .map((service) => `- ${service.name}: R$ ${service.price.toFixed(2)}${service.duration ? ` (${service.duration} min)` : ''}`)
        .join('\n') || 'Nenhum serviço cadastrado no momento.';

      const upcomingAppointments = company.appointments.map((appointment) => {
        const date = new Date(appointment.date).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        return `- ${date} | ${appointment.client?.name || 'Cliente'} | ${appointment.service?.name || 'Serviço'}`;
      }).join('\n');

      const availableSlots = upcomingAppointments
        ? `Próximos horários já reservados:\n${upcomingAppointments}\n\nEnvie um horário específico para verificar disponibilidade.`
        : 'Nenhum agendamento futuro encontrado. Existem horários abertos para os próximos dias.';

      return [`DADOS DO ESTABELECIMENTO:`, `- Nome: ${company.name}`, `- Contato: ${company.phone || 'Não informado'}`, `- Endereço: ${company.address || 'Não informado'}`, ``, `SERVIÇOS DISPONÍVEIS:`, servicesList, ``, `PRÓXIMOS AGENDAMENTOS:`, availableSlots].join('\n');
    } catch (error) {
      console.error('Erro ao buscar contexto da empresa para IA:', error);
      return 'Dados operacionais temporariamente indisponíveis.';
    }
  }

  public static async processMessage(params: ProcessClientMessageParams): Promise<string> {
    const { companyId, userMessage, conversationHistory = [] } = params;
    const databaseContext = await this.fetchCompanyContext(companyId);

    const systemPrompt = [
      'Você é o atendente virtual oficial e exclusivo do estabelecimento comercial integrado a este sistema.',
      'Seu único objetivo é tirar dúvidas sobre serviços, preços, duração e ajudar os clientes a realizarem agendamentos.',
      '',
      'DIRETRIZES DE COMPORTAMENTO OBRIGATÓRIAS:',
      '1. Responda de forma extremamente objetiva, educada, curta e direta ao ponto (estilo WhatsApp).',
      '2. ESCOPO FECHADO: É terminantemente proibido responder perguntas fora do contexto operacional (proibido falar sobre política, clima, piadas, receitas, tecnologia ou assuntos genéricos).',
      '3. Se o cliente perguntar algo fora do escopo, redirecione educadamente para o agendamento ou serviços do local.',
      '4. Utilize exclusivamente os dados reais fornecidos abaixo para responder sobre valores e horários. Nunca invente preços ou horários.',
      '',
      databaseContext,
    ].join('\n');

    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY não configurada para o serviço de IA.');
      return 'No momento estou com instabilidade no atendimento automático. Por favor, entre em contato diretamente pelo nosso WhatsApp de atendimento.';
    }

    try {
      const messages: AIChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage },
      ];

      const completion = await groq.chat.completions.create({
        model: 'llama3-8b-8192',
        messages: messages as any,
        temperature: 0.2,
        max_tokens: 300,
      });

      const responseText = completion.choices?.[0]?.message?.content;
      if (!responseText) {
        return 'Desculpe, tive um breve problema técnico. Poderia repetir sua solicitação de agendamento?';
      }

      return responseText.trim();
    } catch (error) {
      console.error('Erro crítico na API da Groq / Fallback ativado:', error);
      return 'No momento estou com instabilidade no atendimento automático. Por favor, entre em contato diretamente pelo nosso WhatsApp de atendimento.';
    }
  }
}

export interface AutomationPayload {
  companyId: string;
  clientPhone: string;
  messageType: 'text' | 'audio' | 'image';
  mediaUrl?: string;
  textContent?: string;
}

export class MultimodalAutomationService {
  private static async fetchCompanyContext(companyId: string): Promise<string> {
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        include: {
          services: {
            select: { name: true, price: true, duration: true },
            orderBy: { name: 'asc' },
          },
          appointments: {
            where: { date: { gte: new Date() }, companyId },
            take: 10,
            orderBy: { date: 'asc' },
            include: {
              client: { select: { name: true } },
              service: { select: { name: true } },
            },
          },
        },
      });

      if (!company) {
        return 'Estabelecimento não encontrado.';
      }

      const servicesList = company.services
        .map((service) => `- ${service.name}: R$ ${service.price.toFixed(2)}${service.duration ? ` (${service.duration} min)` : ''}`)
        .join('\n') || 'Nenhum serviço cadastrado.';

      const futureWindowStart = new Date();
      const futureWindowEnd = new Date();
      futureWindowEnd.setDate(futureWindowEnd.getDate() + 30);
      const blockedDates = await AppointmentSecurityService.getBlockedDates(companyId, futureWindowStart, futureWindowEnd);
      const blockedDatesText = blockedDates.length > 0
        ? `DATAS BLOQUEADAS/FERIADOS:\n${blockedDates.map((exception: BlockedException) => `- ${new Date(exception.date).toLocaleDateString('pt-BR')} (${exception.type === 'HOLIDAY' ? 'Feriado' : 'Dia de folga'}): ${exception.reason}`).join('\n')}\n\nNão sugira esses dias para agendamento.`
        : 'Nenhuma data bloqueada registrada para os próximos 30 dias.';

      const upcomingAppointments = company.appointments
        .map((appointment) => {
          const date = new Date(appointment.date).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
          return `- ${date} | ${appointment.client?.name || 'Cliente'} | ${appointment.service?.name || 'Serviço'}`;
        })
        .join('\n');

      const availableSlots = upcomingAppointments
        ? `Próximos horários já reservados:\n${upcomingAppointments}\n\nEnvie um horário específico para verificar disponibilidade.`
        : 'Nenhum agendamento futuro encontrado. Existem horários abertos para os próximos dias.';

      return [
        'DADOS DO ESTABELECIMENTO:',
        `- Nome: ${company.name}`,
        `- Contato: ${company.phone || 'Não informado'}`,
        `- Endereço: ${company.address || 'Não informado'}`,
        '',
        'SERVIÇOS DISPONÍVEIS:',
        servicesList,
        '',
        'PRÓXIMOS AGENDAMENTOS:',
        availableSlots,
        '',
        blockedDatesText,
      ].join('\n');
    } catch (error) {
      console.error('Erro ao buscar contexto da empresa:', error);
      return 'Dados operacionais temporariamente indisponíveis.';
    }
  }

  public static async processWebhook(payload: AutomationPayload): Promise<string> {
    const { companyId, messageType, mediaUrl, textContent } = payload;
    const databaseContext = await this.fetchCompanyContext(companyId);

    const systemPrompt = [
      'Você é o atendente virtual avançado (Multimodal) do estabelecimento.',
      'Seu objetivo é gerenciar agendamentos, tirar dúvidas de preços e validar mídias enviadas (comprovantes de Pix ou fotos de referência).',
      '',
      'DIRETRIZES:',
      '1. Seja extremamente objetivo, educado e direto (estilo WhatsApp).',
      '2. Se o cliente enviou uma IMAGEM (comprovante ou referência), analise os dados fornecidos na URL da imagem junto com o contexto para dar o veredito (ex: confirmar se o pagamento Pix confere ou orientar sobre o serviço).',
      '3. Nunca invente preços ou horários. Use os dados reais abaixo.',
      '',
      databaseContext,
    ].join('\n');

    try {
      let messages: any[] = [{ role: 'system', content: systemPrompt }];

      if (messageType === 'image' && mediaUrl) {
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: textContent || 'Analise esta imagem enviada pelo cliente (comprovante ou referência):' },
            { type: 'image_url', image_url: { url: mediaUrl } },
          ],
        });

        const completion = await groq.chat.completions.create({
          model: 'llama-3.2-11b-vision-preview',
          messages,
          temperature: 0.1,
          max_tokens: 250,
        });

        return completion.choices?.[0]?.message?.content?.trim() || 'Imagem recebida e analisada com sucesso.';
      }

      const finalInputText = textContent || 'Olá, gostaria de informações sobre agendamento.';
      messages.push({ role: 'user', content: finalInputText });

      const completion = await groq.chat.completions.create({
        model: 'llama3-8b-8192',
        messages,
        temperature: 0.2,
        max_tokens: 300,
      });

      return completion.choices?.[0]?.message?.content?.trim() || 'Recebido com sucesso.';
    } catch (error) {
      console.error('Erro no processamento multimodal do n8n:', error);
      return 'Tivemos um pequeno problema ao processar sua mídia/mensagem. Por favor, envie novamente.';
    }
  }
}
