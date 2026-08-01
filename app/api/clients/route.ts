import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const clients = await prisma.client.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(clients);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.name) {
      return NextResponse.json({ error: 'Nome do cliente é obrigatório' }, { status: 400 });
    }

    const client = await prisma.client.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        phone: data.phone,
        email: data.email,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
