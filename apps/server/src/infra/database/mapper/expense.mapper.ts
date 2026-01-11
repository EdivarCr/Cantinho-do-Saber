import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { ExpenseEntity } from 'apps/server/src/domain/enterprise/entities/expense.entity';
import { ExpenseSchema } from '../schemas/expense.schema';

export interface ExpensePersistenceDTO {
  id: string;
  description: string;
  category: string;
  amount: number;
  dueDate: Date;
  paidAt: Date | null;
  status: string;
  paymentId: string | null;
  createdAt: Date;
  deletedAt: Date | null;
}

export class ExpenseMapper {
  static toDomain(raw: ExpenseSchema): ExpenseEntity {
    return ExpenseEntity.create(
      {
        description: raw.description,
        category: raw.category,
        amount: raw.amount,
        dueDate: raw.dueDate,
        paidAt: raw.paidAt,
        status: raw.status,
        paymentId: raw.paymentId ?? null,
        createdAt: raw.createdAt,
        deletedAt: raw.deletedAt,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: ExpenseEntity): ExpensePersistenceDTO {
    return {
      id: entity.id.toString(),
      description: entity.description,
      category: entity.category,
      amount: entity.amount,
      dueDate: entity.dueDate,
      paidAt: entity.paidAt,
      status: entity.status,
      paymentId: entity.paymentId,
      createdAt: entity.createdAt,
      deletedAt: entity.deletedAt,
    };
  }
}
