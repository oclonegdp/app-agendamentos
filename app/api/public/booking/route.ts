import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AppointmentSecurityService } from '@/lib/appointmentSecurityService';
import { MultimodalAutomationService } from '@/lib/aiService';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { companyId, serviceId, serviceName, date, name, phone } = data;

    if (!companyId || (!serviceId && !serviceName) || !date || !name || !phone) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // find or create client by phone
    let client = await prisma.client.findFirst({ where: { phone } });
    if (!client) {
      client = await prisma.client.create({ data: { companyId, name, phone } });
    }

    // find service by id if provided, otherwise by name
    let service = null;
    if (serviceId) {
      service = await prisma.service.findUnique({ where: { id: serviceId } });
    }
    if (!service && serviceName) {
      service = await prisma.service.findFirst({ where: { name: serviceName, companyId } });
    }
    if (!service) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 400 });
    }

    const appointmentDate = new Date(date);

    const secureResult = await AppointmentSecurityService.createSecureAppointment({
      companyId,
      clientId: client.id,
      serviceId: service.id,
      date: appointmentDate,
    });

    if (!secureResult.success) {
      return NextResponse.json({ error: secureResult.error }, { status: secureResult.statusCode });
    }

    // trigger automation notification (best-effort) and persist AutomationLog
    let automationResult = null;
    let automationStatus: any = 'PENDING';
    try {
      const message = `Novo agendamento: ${name} - ${service.name} em ${appointmentDate.toLocaleString('pt-BR')}`;
      automationResult = await MultimodalAutomationService.processWebhook({
        companyId,
        clientPhone: phone,
        messageType: 'text',
        textContent: message,
      });
      automationStatus = 'COMPLETED';
      console.log('Automation triggered:', { companyId, clientPhone: phone, message, automationResult });
    } catch (err: any) {
      automationStatus = 'FAILED';
      console.error('Erro ao acionar automação:', err);
      automationResult = { error: String(err?.message ?? err) };
    }

    // persist automation log (best-effort)
    try {
      await prisma.automationLog.create({
        data: {
          companyId: companyId,
          appointmentId: secureResult.data?.id,
          actionType: 'booking_notification',
          payload: {
            name,
            phone,
            serviceId: service.id,
            serviceName: service.name,
            date: appointmentDate.toISOString(),
          },
          result: automationResult,
          status: automationStatus,
        },
      });
    } catch (err) {
      console.error('Erro ao salvar AutomationLog:', err);
    }

    return NextResponse.json({ success: true, appointment: secureResult.data, automationResult }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
