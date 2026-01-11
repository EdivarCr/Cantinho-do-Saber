import { Either, succeed } from 'apps/server/src/core/either';
import { inject, singleton } from 'tsyringe';
import { ExpenseEntity } from '../../../enterprise/entities/expense.entity';
import {
  EXPENSE_REPOSITORY_TOKEN,
  IExpenseRepository,
} from '../../repositories/expense.repository';

type GetExpensesByMonthRequest = {
  month: string; // YYYY-MM
};

type GetExpensesByMonthResponse = Either<never, { expenses: ExpenseEntity[] }>;

@singleton()
export class GetExpensesByMonthUseCase {
  constructor(
    @inject(EXPENSE_REPOSITORY_TOKEN) private expenseRepo: IExpenseRepository,
  ) {}

  async execute(request: GetExpensesByMonthRequest): Promise<GetExpensesByMonthResponse> {
    console.log('[GetExpensesByMonthUseCase] Getting expenses for month:', request.month);

    const expenses = await this.expenseRepo.findByMonth(request.month);

    console.log('[GetExpensesByMonthUseCase] Found', expenses.length, 'expenses');
    return succeed({ expenses });
  }
}
