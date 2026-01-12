import { TeacherPaymentEntity } from 'apps/server/src/domain/enterprise/entities/teacher-payment.entity';

export class TeacherPaymentPresenter {
  static toHTTP(entity: TeacherPaymentEntity, teacherName?: string) {
    return {
      id: entity.id.toString(),
      teacherId: entity.teacherId,
      teacherName: teacherName || '',
      month: entity.month,
      activeStudents: entity.activeStudents,
      totalContracts: entity.totalContracts,
      participationRate: entity.participationRate,
      realizedRevenue: entity.realizedRevenue,
      amountToPay: entity.amountToPay,
      status: entity.status,
      paidAt: entity.paidAt?.toISOString() || null,
      paymentMethod: entity.paymentMethod,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}

