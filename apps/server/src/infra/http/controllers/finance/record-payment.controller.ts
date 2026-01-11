import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { RecordPaymentUseCase } from 'apps/server/src/domain/application/use-cases/finance/record-payment.use-case';

const recordPaymentBodySchema = z.object({
  paymentId: z.string(),
  paymentDate: z.string().transform((val) => new Date(val)),
  paymentMethod: z.string(),
});

type RecordPaymentBodySchema = z.infer<typeof recordPaymentBodySchema>;

const bodyValidationPipe = validateBody(recordPaymentBodySchema);

@injectable()
export class RecordPaymentController {
  public readonly router: Router;

  constructor(private readonly recordPaymentUseCase: RecordPaymentUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post('/payments/record', checkJwt, bodyValidationPipe, this.handle.bind(this));
  }

  async handle(req: Request, res: Response) {
    const body = req.body as RecordPaymentBodySchema;

    const result = await this.recordPaymentUseCase.execute(body);

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

    const { paymentId } = result.value;
    return res.status(200).json({ paymentId });
  }
}
