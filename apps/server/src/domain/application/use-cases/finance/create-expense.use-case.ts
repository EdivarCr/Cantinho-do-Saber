import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { inject, singleton } from 'tsyringe';
import { ExpenseEntity } from '../../../enterprise/entities/expense.entity';
import {
  EXPENSE_REPOSITORY_TOKEN,
  IExpenseRepository,
} from '../../repositories/expense.repository';

type CreateExpenseRequest = {
  description: string;
  category: string;
  amount: number;
  dueDate: Date;
  status: string;
};

type CreateExpenseResponse = Either<CannotCreateError, { expenseId: string }>;

@singleton()
export class CreateExpenseUseCase {
  constructor(
    @inject(EXPENSE_REPOSITORY_TOKEN) private expenseRepo: IExpenseRepository,
  ) {}

  async execute(request: CreateExpenseRequest): Promise<CreateExpenseResponse> {
    try {
      console.log('[CreateExpenseUseCase] Creating expense:', request.description);

      const expense = ExpenseEntity.create({
        description: request.description,
        category: request.category,
        amount: request.amount,
        dueDate: request.dueDate,
        status: request.status,
      });

      const created = await this.expenseRepo.create(expense);
      if (!created) {
        console.error('[CreateExpenseUseCase] Failed to create expense');
        return fail(new CannotCreateError('Expense'));
      }

      console.log('[CreateExpenseUseCase] Expense created:', expense.id.toString());
      return succeed({ expenseId: expense.id.toString() });
    } catch (error) {
      console.error('[CreateExpenseUseCase] Error:', error);
      return fail(new Error('Cannot create expense: ' + (error as Error).message));
    }
  }
}
