import { NextResponse } from 'next/server';
import { getAuthPayloadFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const auth = getAuthPayloadFromRequest(request);

    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const dateFilter = startDate && endDate ? {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    } : {};

    const companyFilter = auth.companyId ? { companyId: auth.companyId } : {};

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const [appointments, expenses, todayAppointments, todayExpenseList, todayAppointmentList, todayTransactions, clientsCount, stockCount] = await Promise.all([
      prisma.appointment.findMany({
        where: { ...companyFilter, ...dateFilter },
        include: { service: true },
      }),
      prisma.expense.findMany({
        where: { ...companyFilter, ...dateFilter },
      }),
      prisma.appointment.findMany({
        where: {
          ...companyFilter,
          date: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
        include: { client: true, service: true, staff: true },
        orderBy: { date: 'asc' },
      }),
      prisma.expense.findMany({
        where: {
          ...companyFilter,
          date: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),
      prisma.appointment.findMany({
        where: {
          ...companyFilter,
          date: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
        include: { client: true, service: true, staff: true },
        orderBy: { date: 'asc' },
      }),
      prisma.transaction.findMany({
        where: {
          ...companyFilter,
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),
      prisma.client.count({ where: companyFilter }),
      prisma.stock.count({ where: companyFilter }),
    ]);

    const totalRevenue = appointments.reduce(
      (acc: number, curr: { price?: number | null; service?: { price?: number | null } | null }) => acc + (curr.price || curr.service?.price || 0),
      0,
    );
    const totalExpenses = expenses.reduce(
      (acc: number, curr: { amount?: number | null }) => acc + (curr.amount || 0),
      0,
    );
    const todayRevenue = todayAppointments.reduce(
      (acc: number, curr: { price?: number | null; service?: { price?: number | null } | null }) => acc + (curr.price || curr.service?.price || 0),
      0,
    );
    const todayExpenses = todayExpenseList.reduce((acc: number, curr: { amount?: number | null }) => acc + (curr.amount || 0), 0);
    const paymentMethodTotals = todayTransactions.reduce(
      (acc: Record<'PIX' | 'CREDIT' | 'DEBIT' | 'CASH', number>, curr: any) => {
        if (curr.type === 'INFLOW') {
          const key = curr.paymentMethod as 'PIX' | 'CREDIT' | 'DEBIT' | 'CASH';
          acc[key] = (acc[key] || 0) + (curr.amount || 0);
        }
        return acc;
      },
      { PIX: 0, CREDIT: 0, DEBIT: 0, CASH: 0 } as Record<'PIX' | 'CREDIT' | 'DEBIT' | 'CASH', number>,
    );
    const netProfit = totalRevenue - totalExpenses;
    const todayNetProfit = todayRevenue - todayExpenses;

    return NextResponse.json({
      totalRevenue,
      totalExpenses,
      netProfit,
      totalAppointments: appointments.length,
      clientsCount,
      stockCount,
      todayRevenue,
      todayExpenses,
      todayNetProfit,
      todayAppointments: todayAppointments.length,
      todayAppointmentList,
      paymentMethodTotals,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
