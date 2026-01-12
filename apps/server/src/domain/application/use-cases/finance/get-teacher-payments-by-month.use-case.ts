import { inject, injectable } from 'tsyringe';
import { Either, fail, succeed } from 'apps/server/src/core/either';
import {
  ITeacherPaymentRepository,
  TEACHER_PAYMENT_REPOSITORY_TOKEN,
} from '../../repositories/teacher-payment.repository';
import { TeacherPaymentEntity } from 'apps/server/src/domain/enterprise/entities/teacher-payment.entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { prisma } from 'packages/database/src/client';

interface GetTeacherPaymentsByMonthRequest {
  month: string; // YYYY-MM format
}

interface TeacherPaymentWithName {
  payment: TeacherPaymentEntity;
  teacherName: string;
}

type GetTeacherPaymentsByMonthResponse = Either<
  Error,
  { teacherPayments: TeacherPaymentWithName[] }
>;

@injectable()
export class GetTeacherPaymentsByMonthUseCase {
  constructor(
    @inject(TEACHER_PAYMENT_REPOSITORY_TOKEN)
    private readonly teacherPaymentRepository: ITeacherPaymentRepository,
  ) {}

  async execute(
    request: GetTeacherPaymentsByMonthRequest,
  ): Promise<GetTeacherPaymentsByMonthResponse> {
    const { month } = request;

    try {
      // Get teacher payments with teacher info via Prisma
      const rawPayments = await prisma.teacherPayment.findMany({
        where: {
          month,
          deletedAt: null,
        },
        include: {
          teacher: true,
        },
      });

      const teacherPayments: TeacherPaymentWithName[] = rawPayments.map((tp) => ({
        payment: TeacherPaymentEntity.create(
          {
            teacherId: tp.teacherId,
            month: tp.month,
            activeStudents: tp.activeStudents,
            totalContracts: tp.totalContracts,
            participationRate: tp.participationRate,
            realizedRevenue: tp.realizedRevenue,
            amountToPay: tp.amountToPay,
            status: tp.status,
            paidAt: tp.paidAt,
            paymentMethod: tp.paymentMethod,
            createdAt: tp.createdAt,
            deletedAt: tp.deletedAt,
          },
          new UniqueEntityId(tp.id),
        ),
        teacherName: tp.teacher.name,
      }));

      return succeed({ teacherPayments });
    } catch (error) {
      console.error('[GetTeacherPaymentsByMonthUseCase] Error:', error);
      return fail(error as Error);
    }
  }
}

