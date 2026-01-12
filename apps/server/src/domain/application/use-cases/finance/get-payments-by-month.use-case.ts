import { inject, injectable } from 'tsyringe';
import { Either, fail, succeed } from 'apps/server/src/core/either';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY_TOKEN,
} from '../../repositories/payment.repository';
import { PaymentEntity } from 'apps/server/src/domain/enterprise/entities/payment.entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { prisma } from 'packages/database/src/client';

interface GetPaymentsByMonthRequest {
  month: string; // YYYY-MM format
}

interface PaymentWithStudent {
  payment: PaymentEntity;
  studentId: string;
  studentName: string;
  className: string;
}

type GetPaymentsByMonthResponse = Either<Error, { payments: PaymentWithStudent[] }>;

@injectable()
export class GetPaymentsByMonthUseCase {
  constructor(
    @inject(PAYMENT_REPOSITORY_TOKEN)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(request: GetPaymentsByMonthRequest): Promise<GetPaymentsByMonthResponse> {
    const { month } = request;

    try {
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59);

      // Get payments with student info via Prisma
      const rawPayments = await prisma.payment.findMany({
        where: {
          dueDate: { gte: startDate, lte: endDate },
          deletedAt: null,
        },
        include: {
          enrollment: {
            include: {
              student: {
                include: {
                  class: true,
                },
              },
            },
          },
        },
      });

      const payments: PaymentWithStudent[] = rawPayments.map((p) => ({
        payment: PaymentEntity.create(
          {
            amount: p.amount,
            dueDate: p.dueDate,
            paymentDate: p.paymentDate,
            status: p.status,
            paymentMethod: p.paymentMethod,
            enrollmentId: p.enrollmentId,
            createdAt: p.createdAt,
            deletedAt: p.deletedAt,
          },
          new UniqueEntityId(p.id),
        ),
        studentId: p.enrollment.studentId,
        studentName: p.enrollment.student.name,
        className: p.enrollment.student.class?.name || 'Sem turma',
      }));

      return succeed({ payments });
    } catch (error) {
      console.error('[GetPaymentsByMonthUseCase] Error:', error);
      return fail(error as Error);
    }
  }
}

