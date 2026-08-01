import { NextResponse } from 'next/server';
import { getAuthPayloadFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppointmentSecurityService } from '@/lib/appointmentSecurityService';

export async function GET(request: Request) {
  try {
    const auth = getAuthPayloadFromRequest(request);

    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const where: any = { companyId: auth.companyId ?? undefined };

    if (date) {
      where.date = new Date(date);
    }

    if (auth.role === 'STAFF') {
      const staff = await prisma.staff.findUnique({ where: { userId: auth.userId } });
      if (staff) {
        where.staffId = staff.id;
      }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: { client: true, service: true, staff: true },
      orderBy: { date: 'asc' },
    });
    return NextResponse.json(appointments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = getAuthPayloadFromRequest(request);

    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const appointmentDate = new Date(data.date);

    if (!data.clientId || !data.serviceId || Number.isNaN(appointmentDate.valueOf())) {
      return NextResponse.json({ error: 'Dados do agendamento inválidos' }, { status: 400 });
    }

    const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
    if (!service || service.companyId !== auth.companyId) {
      return NextResponse.json({ error: 'Serviço inválido' }, { status: 400 });
    }

    const secureResult = await AppointmentSecurityService.createSecureAppointment({
      companyId: auth.companyId as string,
      clientId: data.clientId,
      serviceId: data.serviceId,
      professionalId: data.staffId,
      date: appointmentDate,
    });

    if (!secureResult.success) {
      return NextResponse.json(
        { error: secureResult.error },
        { status: secureResult.statusCode }
      );
    }

    return NextResponse.json(secureResult.data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
