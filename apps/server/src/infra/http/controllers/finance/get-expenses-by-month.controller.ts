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
    const { month } = req.params;

    const result = await this.getExpensesByMonthUseCase.execute({ month });

    const { expenses } = result.value;
    return res.status(200).json({
      expenses: expenses.map(ExpensePresenter.toHTTP),
    });
  }
}
