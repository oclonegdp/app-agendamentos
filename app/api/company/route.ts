import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const company = await prisma.company.findFirst();
    return NextResponse.json(company || {});
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const company = await prisma.company.findFirst();
    
    if (!company) {
      const newCompany = await prisma.company.create({ data });
      return NextResponse.json(newCompany);
    }

    const updated = await prisma.company.update({
      where: { id: company.id },
      data,
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
