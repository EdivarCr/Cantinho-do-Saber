import { Router, Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { ProcessOverduePaymentsUseCase } from 'apps/server/src/domain/application/use-cases/finance/process-overdue-payments.use-case';

@injectable()
export class ProcessOverduePaymentsController {
  public readonly router: Router;

  constructor(@inject(ProcessOverduePaymentsUseCase) private useCase: ProcessOverduePaymentsUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post('/finance/process-overdue', checkJwt, this.handle.bind(this));
  }

  async handle(req: Request, res: Response) {
    try {
      console.log('[ProcessOverduePaymentsController] Processing overdue payments...');

      const result = await this.useCase.execute();

      if (result.isFail()) {
        console.error('[ProcessOverduePaymentsController] Use case failed:', result.value);
        return res.status(500).json({ message: (result.value as Error).message });
      }

      console.log('[ProcessOverduePaymentsController] Success:', result.value);

      return res.status(200).json({
        message: 'Overdue payments processed successfully',
        processedCount: result.value.processedCount,
        expensesCreated: result.value.expensesCreated,
      });
    } catch (error) {
      console.error('[ProcessOverduePaymentsController] Error:', error);
      return res.status(500).json({ 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
