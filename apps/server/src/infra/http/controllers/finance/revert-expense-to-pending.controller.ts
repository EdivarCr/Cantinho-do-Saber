import { Router, Request, Response } from 'express';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { RevertExpenseToPendingUseCase } from 'apps/server/src/domain/application/use-cases/finance/revert-expense-to-pending.use-case';

@injectable()
export class RevertExpenseToPendingController {
  public readonly router: Router;

  constructor(private readonly revertExpenseToPendingUseCase: RevertExpenseToPendingUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.patch('/expenses/:expenseId/revert', checkJwt, this.handle.bind(this));
  }

  async handle(req: Request, res: Response) {
    const { expenseId } = req.params;

    const result = await this.revertExpenseToPendingUseCase.execute({ expenseId });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case ResourceNotFoundError:
          return res.status(404).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    return res.status(200).json({ expenseId: result.value.expenseId });
  }
}

