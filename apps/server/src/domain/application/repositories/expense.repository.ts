import { ExpenseEntity } from '../../enterprise/entities/expense.entity';

export interface IExpenseRepository {
  create(expense: ExpenseEntity): Promise<boolean>;
  findById(id: string): Promise<ExpenseEntity | null>;
  findByMonth(month: string): Promise<ExpenseEntity[]>;
  update(expense: ExpenseEntity): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}

export const EXPENSE_REPOSITORY_TOKEN = Symbol('ExpenseRepository');
