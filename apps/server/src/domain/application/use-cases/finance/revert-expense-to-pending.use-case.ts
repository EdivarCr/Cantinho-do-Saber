import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { inject, singleton } from 'tsyringe';
import {
  EXPENSE_REPOSITORY_TOKEN,
  IExpenseRepository,
} from '../../repositories/expense.repository';

type RevertExpenseToPendingRequest = {
  expenseId: string;
};

type RevertExpenseToPendingResponse = Either<ResourceNotFoundError | Error, { expenseId: string }>;

@singleton()
export class RevertExpenseToPendingUseCase {
  constructor(@inject(EXPENSE_REPOSITORY_TOKEN) private expenseRepo: IExpenseRepository) {}

  async execute(request: RevertExpenseToPendingRequest): Promise<RevertExpenseToPendingResponse> {
    try {
      console.log(
        '[RevertExpenseToPendingUseCase] Reverting expense to pending:',
        request.expenseId,
      );

      const expense = await this.expenseRepo.findById(request.expenseId);
      if (!expense) {
        console.error('[RevertExpenseToPendingUseCase] Expense not found');
        return fail(new ResourceNotFoundError('Expense'));
      }

      expense.status = 'PENDENTE';
      expense.paidAt = null;

      const updated = await this.expenseRepo.update(expense);
      if (!updated) {
        console.error('[RevertExpenseToPendingUseCase] Failed to update expense');
        return fail(new Error('Failed to update expense'));
      }

      console.log('[RevertExpenseToPendingUseCase] Expense reverted to pending successfully');
      return succeed({ expenseId: expense.id.toString() });
    } catch (error) {
      console.error('[RevertExpenseToPendingUseCase] Error:', error);
      return fail(new Error('Cannot revert expense to pending: ' + (error as Error).message));
    }
  }
}

