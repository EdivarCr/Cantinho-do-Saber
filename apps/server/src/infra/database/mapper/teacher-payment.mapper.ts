import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { TeacherPaymentEntity } from 'apps/server/src/domain/enterprise/entities/teacher-payment.entity';
import { TeacherPaymentSchema } from '../schemas/teacher-payment.schema';

export interface TeacherPaymentPersistenceDTO {
  id: string;
  teacherId: string;
  month: string;
  activeStudents: number;
  totalContracts: number;
  participationRate: number;
  realizedRevenue: number;
  amountToPay: number;
  status: string;
  paidAt: Date | null;
  paymentMethod: string | null;
  createdAt: Date;
  deletedAt: Date | null;
}

export class TeacherPaymentMapper {
  static toDomain(raw: TeacherPaymentSchema): TeacherPaymentEntity {
    return TeacherPaymentEntity.create(
      {
        teacherId: raw.teacherId,
        month: raw.month,
        activeStudents: raw.activeStudents,
        totalContracts: raw.totalContracts,
        participationRate: raw.participationRate,
        realizedRevenue: raw.realizedRevenue,
        amountToPay: raw.amountToPay,
        status: raw.status,
        paidAt: raw.paidAt,
        paymentMethod: raw.paymentMethod,
        createdAt: raw.createdAt,
        deletedAt: raw.deletedAt,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: TeacherPaymentEntity): TeacherPaymentPersistenceDTO {
    return {
      id: entity.id.toString(),
      teacherId: entity.teacherId,
      month: entity.month,
      activeStudents: entity.activeStudents,
      totalContracts: entity.totalContracts,
      participationRate: entity.participationRate,
      realizedRevenue: entity.realizedRevenue,
      amountToPay: entity.amountToPay,
      status: entity.status,
      paidAt: entity.paidAt,
      paymentMethod: entity.paymentMethod,
      createdAt: entity.createdAt,
      deletedAt: entity.deletedAt,
    };
  }
}
