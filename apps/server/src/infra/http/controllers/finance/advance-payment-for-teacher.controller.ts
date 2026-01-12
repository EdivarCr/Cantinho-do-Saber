import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { injectable } from 'tsyringe';
import { checkJwt, requireAnyRole } from '../../../auth/auth.middleware';
import { AdvancePaymentForTeacherUseCase } from 'apps/server/src/domain/application/use-cases/finance/advance-payment-for-teacher.use-case';

const advancePaymentBodySchema = z.object({
  paymentId: z.string(),
  paymentDate: z.string().transform((val) => new Date(val)),
  paymentMethod: z.string(),
  teacherName: z.string(),
  studentName: z.string(),
});

type AdvancePaymentBodySchema = z.infer<typeof advancePaymentBodySchema>;

const bodyValidationPipe = validateBody(advancePaymentBodySchema);

@injectable()
export class AdvancePaymentForTeacherController {
  public readonly router: Router;

  constructor(private readonly advancePaymentUseCase: AdvancePaymentForTeacherUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post(
      '/payments/advance',
      checkJwt,
      requireAnyRole(['ADMIN']),
      bodyValidationPipe,
      this.handle.bind(this),
    );
  }

  async handle(req: Request, res: Response) {
    const body = req.body as AdvancePaymentBodySchema;

    const result = await this.advancePaymentUseCase.execute(body);

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

    return res.status(200).json(result.value);
  }
}

