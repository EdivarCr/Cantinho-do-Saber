import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { Optional } from 'apps/server/src/core/types/optional';

export interface TeacherPaymentProps {
  teacherId: string;
  month: string; // YYYY-MM
  activeStudents: number; // Quantidade de alunos ativos
  totalContracts: number; // Total de contratos
  participationRate: number; // Ex: 0.50 para 50%
  realizedRevenue: number; // Receita realizada (baixas)
  amountToPay: number; // Valor a pagar
  status: string; // PENDENTE, PAGO
  paidAt: Date | null;
  paymentMethod: string | null; // PIX, DINHEIRO, MISTO

  createdAt: Date;
  deletedAt: Date | null;
}

export class TeacherPaymentEntity extends Entity<TeacherPaymentProps> {
  get teacherId() {
    return this.props.teacherId;
  }

  get month() {
    return this.props.month;
  }

  get activeStudents() {
    return this.props.activeStudents;
  }

  get totalContracts() {
    return this.props.totalContracts;
  }

  get participationRate() {
    return this.props.participationRate;
  }

  get realizedRevenue() {
    return this.props.realizedRevenue;
  }

  get amountToPay() {
    return this.props.amountToPay;
  }

  get status() {
    return this.props.status;
  }

  set status(status: string) {
    this.props.status = status;
  }

  get paidAt() {
    return this.props.paidAt;
  }

  set paidAt(date: Date | null) {
    this.props.paidAt = date;
  }

  get paymentMethod() {
    return this.props.paymentMethod;
  }

  set paymentMethod(method: string | null) {
    this.props.paymentMethod = method;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get deletedAt() {
    return this.props.deletedAt;
  }

  static create(
    props: Optional<TeacherPaymentProps, 'createdAt' | 'deletedAt' | 'paidAt' | 'paymentMethod'>,
    id?: UniqueEntityId,
  ): TeacherPaymentEntity {
    const teacherPayment = new TeacherPaymentEntity(
      {
        ...props,
        paidAt: props.paidAt ?? null,
        paymentMethod: props.paymentMethod ?? null,
        createdAt: props.createdAt ?? new Date(),
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
    return teacherPayment;
  }
}
