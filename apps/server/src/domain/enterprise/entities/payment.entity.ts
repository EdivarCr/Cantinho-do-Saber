import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { Optional } from 'apps/server/src/core/types/optional';

export interface PaymentProps {
  amount: number;
  dueDate: Date;
  paymentDate: Date | null;
  status: string; // PENDENTE, PAGO, ATRASADO
  paymentMethod: string | null; // PIX, DINHEIRO, MISTO
  enrollmentId: string;

  createdAt: Date;
  deletedAt: Date | null;
}

export class PaymentEntity extends Entity<PaymentProps> {
  get amount() {
    return this.props.amount;
  }

  get dueDate() {
    return this.props.dueDate;
  }

  get paymentDate() {
    return this.props.paymentDate;
  }

  set paymentDate(date: Date | null) {
    this.props.paymentDate = date;
  }

  get status() {
    return this.props.status;
  }

  set status(status: string) {
    this.props.status = status;
  }

  get paymentMethod() {
    return this.props.paymentMethod;
  }

  set paymentMethod(method: string | null) {
    this.props.paymentMethod = method;
  }

  get enrollmentId() {
    return this.props.enrollmentId;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get deletedAt() {
    return this.props.deletedAt;
  }

  static create(
    props: Optional<PaymentProps, 'createdAt' | 'deletedAt' | 'paymentDate' | 'paymentMethod'>,
    id?: UniqueEntityId,
  ): PaymentEntity {
    const payment = new PaymentEntity(
      {
        ...props,
        paymentDate: props.paymentDate ?? null,
        paymentMethod: props.paymentMethod ?? null,
        createdAt: props.createdAt ?? new Date(),
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
    return payment;
  }
}
