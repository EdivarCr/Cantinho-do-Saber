import { ExpenseEntity } from 'apps/server/src/domain/enterprise/entities/expense.entity';

export class ExpensePresenter {
  static toHTTP(expenseEntity: ExpenseEntity) {
    return {
      id: expenseEntity.id.toString(),
      description: expenseEntity.description,
      category: expenseEntity.category,
      amount: expenseEntity.amount,
      dueDate: expenseEntity.dueDate,
      paidAt: expenseEntity.paidAt,
      status: expenseEntity.status,
      createdAt: expenseEntity.createdAt,
    };
  }
}
