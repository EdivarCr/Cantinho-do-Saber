import { PaymentEntity } from 'apps/server/src/domain/enterprise/entities/payment.entity';

export class PaymentPresenter {
  static toHTTP(entity: PaymentEntity) {
    return {
      id: entity.id.toString(),
      amount: entity.amount,
      dueDate: entity.dueDate.toISOString(),
      paymentDate: entity.paymentDate?.toISOString() || null,
      status: entity.status,
      paymentMethod: entity.paymentMethod,
      enrollmentId: entity.enrollmentId,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}

