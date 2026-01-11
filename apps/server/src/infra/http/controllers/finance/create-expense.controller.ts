import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { CreateExpenseUseCase } from 'apps/server/src/domain/application/use-cases/finance/create-expense.use-case';

const createExpenseBodySchema = z.object({
  description: z.string(),
  category: z.string(),
  amount: z.number().positive(),
  dueDate: z.string().transform((val) => new Date(val)),
  paidAt: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  status: z.string(),
});

type CreateExpenseBodySchema = z.infer<typeof createExpenseBodySchema>;

const bodyValidationPipe = validateBody(createExpenseBodySchema);

@injectable()
export class CreateExpenseController {
  public readonly router: Router;

  constructor(private readonly createExpenseUseCase: CreateExpenseUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post('/expenses', checkJwt, bodyValidationPipe, this.handle.bind(this));
  }

  async handle(req: Request, res: Response) {
    try {
      console.log('[CreateExpenseController] ========== START ==========');
      console.log('[CreateExpenseController] Request body:', JSON.stringify(req.body, null, 2));

      const body = req.body as CreateExpenseBodySchema;

      console.log('[CreateExpenseController] Parsed data:', body);

      const result = await this.createExpenseUseCase.execute(body);

      if (result.isFail()) {
        const exception = result.value;
        const message = exception.message;

        console.error('[CreateExpenseController] ❌ Use case FAILED:', exception);

        switch (exception.constructor) {
          case CannotCreateError:
            return res.status(400).json({ message });
          default:
            return res.status(500).json({ message });
        }
      }

      const { expenseId } = result.value;

      console.log('[CreateExpenseController] ✅ SUCCESS - Expense ID:', expenseId);
      console.log('[CreateExpenseController] ========== END ==========');

      return res.status(201).json({ 
        message: 'Expense created successfully',
        expenseId 
      });
    } catch (error) {
      console.error('[CreateExpenseController] ❌ EXCEPTION:', error);
      return res.status(500).json({ 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
