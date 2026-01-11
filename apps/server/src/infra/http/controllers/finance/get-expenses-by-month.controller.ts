import { Router, Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { GetExpensesByMonthUseCase } from 'apps/server/src/domain/application/use-cases/finance/get-expenses-by-month.use-case';
import { ExpensePresenter } from '../../presenters/expense.presenter';

@injectable()
export class GetExpensesByMonthController {
  public readonly router: Router;

  constructor(private readonly getExpensesByMonthUseCase: GetExpensesByMonthUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get('/expenses/month/:month', checkJwt, this.handle.bind(this));
  }

  async handle(req: Request, res: Response) {
    try {
      const { month } = req.params;
      console.log('[GetExpensesByMonthController] Fetching expenses for month:', month);

      const result = await this.getExpensesByMonthUseCase.execute({ month });

      if (result.isFail()) {
        const exception = result.value;
        console.error('[GetExpensesByMonthController] Use case failed:', exception);
        return res.status(500).json({ message: exception.message });
      }

      const { expenses } = result.value;
      console.log('[GetExpensesByMonthController] Found expenses:', expenses.length);

      return res.status(200).json({
        expenses: expenses.map(ExpensePresenter.toHTTP),
      });
    } catch (error) {
      console.error('[GetExpensesByMonthController] Error:', error);
      return res.status(500).json({ 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
