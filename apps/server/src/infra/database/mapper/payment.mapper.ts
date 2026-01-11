import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { PaymentEntity } from 'apps/server/src/domain/enterprise/entities/payment.entity';
import { PaymentSchema } from '../schemas/payment.schema';

export interface PaymentPersistenceDTO {
  id: string;
  amount: number;
  dueDate: Date;
  paymentDate: Date | null;
  status: string;
  paymentMethod: string | null;
  enrollmentId: string;
  createdAt: Date;
  deletedAt: Date | null;
}

export class PaymentMapper {
  static toDomain(raw: PaymentSchema): PaymentEntity {
    return PaymentEntity.create(
      {
        amount: raw.amount,
        dueDate: raw.dueDate,
        paymentDate: raw.paymentDate,
        status: raw.status,
        paymentMethod: raw.paymentMethod,
        enrollmentId: raw.enrollmentId,
        createdAt: raw.createdAt,
        deletedAt: raw.deletedAt,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: PaymentEntity): PaymentPersistenceDTO {
    return {
      id: entity.id.toString(),
      amount: entity.amount,
      dueDate: entity.dueDate,
      paymentDate: entity.paymentDate,
      status: entity.status,
      paymentMethod: entity.paymentMethod,
      enrollmentId: entity.enrollmentId,
      createdAt: entity.createdAt,
      deletedAt: entity.deletedAt,
    };
  }
}
