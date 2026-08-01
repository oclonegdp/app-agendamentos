import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Generates simple time slots between start and end with interval minutes
function generateTimeSlots(start = '09:00', end = '19:00', intervalMinutes = 60) {
  const slots: string[] = [];
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  const startDate = new Date();
  startDate.setHours(startH, startM, 0, 0);
  const endDate = new Date();
  endDate.setHours(endH, endM, 0, 0);

  for (let d = new Date(startDate); d <= endDate; d.setMinutes(d.getMinutes() + intervalMinutes)) {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    slots.push(`${hh}:${mm}`);
  }

  return slots;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId');
    const dateParam = url.searchParams.get('date');

    if (!companyId || !dateParam) {
      return NextResponse.json({ error: 'companyId and date are required' }, { status: 400 });
    }

    const date = new Date(dateParam);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: { companyId, date: { gte: dayStart, lte: dayEnd } },
    });

    const bookedTimes = new Set(appointments.map((a) => {
      const d = new Date(a.date);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }));

    const rawSlots = generateTimeSlots('09:00', '19:00', 60);
    const slots = rawSlots.map((time) => ({ time, available: !bookedTimes.has(time) }));

    return NextResponse.json({ date: dateParam, slots });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
