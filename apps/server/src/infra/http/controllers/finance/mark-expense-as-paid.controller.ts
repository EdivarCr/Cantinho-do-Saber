import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { MarkExpenseAsPaidUseCase } from 'apps/server/src/domain/application/use-cases/finance/mark-expense-as-paid.use-case';

const markExpenseAsPaidBodySchema = z.object({
  paidAt: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
});

type MarkExpenseAsPaidBodySchema = z.infer<typeof markExpenseAsPaidBodySchema>;

const bodyValidationPipe = validateBody(markExpenseAsPaidBodySchema);

@injectable()
export class MarkExpenseAsPaidController {
  public readonly router: Router;

  constructor(private readonly markExpenseAsPaidUseCase: MarkExpenseAsPaidUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.patch(
      '/expenses/:expenseId/pay',
      checkJwt,
      bodyValidationPipe,
      this.handle.bind(this),
    );
  }

  async handle(req: Request, res: Response) {
    const { expenseId } = req.params;
    const body = req.body as MarkExpenseAsPaidBodySchema;

    const result = await this.markExpenseAsPaidUseCase.execute({
      expenseId,
      paidAt: body.paidAt,
    });

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

