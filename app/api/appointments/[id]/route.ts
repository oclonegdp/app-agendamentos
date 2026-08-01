import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const updateData: Record<string, any> = {};

    if (data.date) {
      const appointmentDate = new Date(data.date);
      if (Number.isNaN(appointmentDate.valueOf())) {
        return NextResponse.json({ error: 'Data inválida' }, { status: 400 });
      }

      const conflictWhere: any = {
        date: appointmentDate,
        NOT: { id },
      };

      if (data.staffId) {
        conflictWhere.staffId = data.staffId;
      }

      const conflict = await prisma.appointment.findFirst({
        where: conflictWhere,
      });

      if (conflict) {
        return NextResponse.json(
          { error: 'Já existe um agendamento neste horário. Escolha outro horário.' },
          { status: 409 }
        );
      }

      updateData.date = appointmentDate;
    }

    if (data.clientId) updateData.clientId = data.clientId;
    if (data.serviceId) updateData.serviceId = data.serviceId;
    if (data.staffId) updateData.staffId = data.staffId;
    if (data.status) updateData.status = data.status;
    if (data.price != null) updateData.price = data.price;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        service: true,
        staff: true,
      },
    });

    const staffId = appointment.staffId ?? appointment.staff?.id;
    if (data.status === 'COMPLETED' && staffId) {
      const staff = await prisma.staff.findUnique({ where: { id: staffId } });
      const appointmentValue = appointment.price ?? appointment.service?.price ?? 0;
      const fee = staff ? appointmentValue * (staff.commissionRate / 100) : 0;

      const existingCommission = await prisma.commission.findFirst({
        where: { appointmentId: appointment.id },
      });

      if (fee > 0 && !existingCommission) {
        await prisma.commission.create({
          data: {
            staffId,
            appointmentId: appointment.id,
            amount: fee,
            status: 'PENDING',
          },
        });
      }
    }

    return NextResponse.json(appointment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.appointment.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
