import { PaymentEntity } from '../../enterprise/entities/payment.entity';

export interface IPaymentRepository {
  create(payment: PaymentEntity): Promise<boolean>;
  findById(id: string): Promise<PaymentEntity | null>;
  findByEnrollmentId(enrollmentId: string): Promise<PaymentEntity[]>;
  findByMonth(month: string): Promise<PaymentEntity[]>;
  findByStudentIds(studentIds: string[], month: string): Promise<PaymentEntity[]>;
  findOverdue(currentDate: Date): Promise<PaymentEntity[]>;
  update(payment: PaymentEntity): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}

export const PAYMENT_REPOSITORY_TOKEN = Symbol('PaymentRepository');
