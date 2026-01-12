import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { inject, singleton } from 'tsyringe';
import {
  EXPENSE_REPOSITORY_TOKEN,
  IExpenseRepository,
} from '../../repositories/expense.repository';

type MarkExpenseAsPaidRequest = {
  expenseId: string;
  paidAt?: Date;
};

type MarkExpenseAsPaidResponse = Either<ResourceNotFoundError | Error, { expenseId: string }>;

@singleton()
export class MarkExpenseAsPaidUseCase {
  constructor(@inject(EXPENSE_REPOSITORY_TOKEN) private expenseRepo: IExpenseRepository) {}

  async execute(request: MarkExpenseAsPaidRequest): Promise<MarkExpenseAsPaidResponse> {
    try {
      console.log('[MarkExpenseAsPaidUseCase] Marking expense as paid:', request.expenseId);

      const expense = await this.expenseRepo.findById(request.expenseId);
      if (!expense) {
        console.error('[MarkExpenseAsPaidUseCase] Expense not found');
        return fail(new ResourceNotFoundError('Expense'));
      }

      expense.status = 'PAGO';
      expense.paidAt = request.paidAt || new Date();

      const updated = await this.expenseRepo.update(expense);
      if (!updated) {
        console.error('[MarkExpenseAsPaidUseCase] Failed to update expense');
        return fail(new Error('Failed to update expense'));
      }

      console.log('[MarkExpenseAsPaidUseCase] Expense marked as paid successfully');
      return succeed({ expenseId: expense.id.toString() });
    } catch (error) {
      console.error('[MarkExpenseAsPaidUseCase] Error:', error);
      return fail(new Error('Cannot mark expense as paid: ' + (error as Error).message));
    }
  }
}

