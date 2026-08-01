import { prisma } from '@/lib/prisma';

export interface CreateAppointmentInput {
  companyId: string;
  clientId: string;
  serviceId: string;
  professionalId?: string;
  date: Date;
  status?: string;
}

export interface BlockedException {
  id: string;
  companyId: string;
  professionalId: string | null;
  date: Date;
  reason: string;
  type: 'HOLIDAY' | 'DAY_OFF';
  createdAt: Date;
}

export class AppointmentSecurityService {
  private static async findBlockingException(
    companyId: string,
    date: Date,
    professionalId?: string,
  ): Promise<BlockedException | null> {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return prisma.companyException.findFirst({
      where: {
        companyId,
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
        OR: professionalId
          ? [
              { professionalId },
              { professionalId: null },
            ]
          : [{ professionalId: null }],
      },
    });
  }

  public static async getBlockedDates(companyId: string, fromDate: Date, toDate: Date): Promise<BlockedException[]> {
    return prisma.companyException.findMany({
      where: {
        companyId,
        date: {
          gte: fromDate,
          lte: toDate,
        },
      },
      orderBy: { date: 'asc' },
    });
  }
  /**
   * Cria um agendamento blindado contra race conditions usando transação atômica.
   */
  public static async createSecureAppointment(input: CreateAppointmentInput) {
    const { companyId, clientId, serviceId, professionalId, date, status } = input;

    try {
      const result = await prisma.$transaction(async (tx) => {
        const service = await tx.service.findFirst({
          where: { id: serviceId, companyId },
        });

        if (!service) {
          throw new Error('UNAUTHORIZED_OR_INVALID_SERVICE');
        }

        const client = await tx.client.findFirst({
          where: { id: clientId, companyId },
        });

        if (!client) {
          throw new Error('CLIENT_NOT_FOUND_FOR_COMPANY');
        }

        const blockingException = await this.findBlockingException(companyId, date, professionalId);
        if (blockingException) {
          throw new Error('DATE_BLOCKED_BY_EXCEPTION');
        }

        const existingConflict = await tx.appointment.findFirst({
          where: {
            companyId,
            date,
            ...(professionalId ? { staffId: professionalId } : {}),
            status: { not: 'CANCELLED' },
          },
        });

        if (existingConflict) {
          throw new Error('TIME_SLOT_ALREADY_BOOKED');
        }

        const newAppointment = await tx.appointment.create({
          data: {
            companyId,
            clientId,
            serviceId,
            staffId: professionalId,
            date,
            status: status || 'CONFIRMED',
          },
          include: {
            client: true,
            service: true,
          },
        });

        return newAppointment;
      });

      return { success: true, data: result };
    } catch (error: any) {
      console.error('Erro na transação de agendamento blindado:', error.message);

      let statusCode = 500;
      let errorMessage = 'Erro interno ao processar o agendamento.';

      if (
        error.message === 'UNAUTHORIZED_OR_INVALID_SERVICE' ||
        error.message === 'CLIENT_NOT_FOUND_FOR_COMPANY'
      ) {
        statusCode = 403;
        errorMessage = 'Acesso negado: Recurso não pertence à empresa autenticada.';
      } else if (error.message === 'TIME_SLOT_ALREADY_BOOKED') {
        statusCode = 409;
        errorMessage = 'Conflito de horário: Este horário acabou de ser reservado por outro cliente.';
      } else if (error.message === 'DATE_BLOCKED_BY_EXCEPTION') {
        statusCode = 409;
        errorMessage = 'Esta data está bloqueada por feriado ou folga da empresa/profissional.';
      }

      return { success: false, statusCode, error: errorMessage };
    }
  }
}
