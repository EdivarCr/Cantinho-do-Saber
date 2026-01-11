import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { Optional } from 'apps/server/src/core/types/optional';

export interface ExpenseProps {
  description: string;
  category: string; // UTILIDADES, SUPRIMENTOS, MANUTENCAO, MARKETING, OUTROS
  amount: number;
  dueDate: Date;
  paidAt: Date | null;
  status: string; // PENDENTE, PAGO, AGENDADO

  createdAt: Date;
  deletedAt: Date | null;
}

export class ExpenseEntity extends Entity<ExpenseProps> {
  get description() {
    return this.props.description;
  }

  get category() {
    return this.props.category;
  }

  get amount() {
    return this.props.amount;
  }

  get dueDate() {
    return this.props.dueDate;
  }

  get paidAt() {
    return this.props.paidAt;
  }

  set paidAt(date: Date | null) {
    this.props.paidAt = date;
  }

  get status() {
    return this.props.status;
  }

  set status(status: string) {
    this.props.status = status;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get deletedAt() {
    return this.props.deletedAt;
  }

  static create(
    props: Optional<ExpenseProps, 'createdAt' | 'deletedAt' | 'paidAt'>,
    id?: UniqueEntityId,
  ): ExpenseEntity {
    const expense = new ExpenseEntity(
      {
        ...props,
        paidAt: props.paidAt ?? null,
        createdAt: props.createdAt ?? new Date(),
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
    return expense;
  }
}
