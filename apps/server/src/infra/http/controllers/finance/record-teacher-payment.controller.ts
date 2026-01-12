import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { injectable } from 'tsyringe';
import { checkJwt, requireAnyRole } from '../../../auth/auth.middleware';
import { RecordTeacherPaymentUseCase } from 'apps/server/src/domain/application/use-cases/finance/record-teacher-payment.use-case';

const recordTeacherPaymentBodySchema = z.object({
  teacherPaymentId: z.string(),
  paymentDate: z.string().transform((val) => new Date(val)),
  paymentMethod: z.string(),
});

type RecordTeacherPaymentBodySchema = z.infer<typeof recordTeacherPaymentBodySchema>;

const bodyValidationPipe = validateBody(recordTeacherPaymentBodySchema);

@injectable()
export class RecordTeacherPaymentController {
  public readonly router: Router;

  constructor(private readonly recordTeacherPaymentUseCase: RecordTeacherPaymentUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post(
      '/teacher-payments/record',
      checkJwt,
      requireAnyRole(['ADMIN']),
      bodyValidationPipe,
      this.handle.bind(this),
    );
  }

  async handle(req: Request, res: Response) {
    const body = req.body as RecordTeacherPaymentBodySchema;

    const result = await this.recordTeacherPaymentUseCase.execute(body);

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

    const { teacherPaymentId } = result.value;
    return res.status(200).json({ teacherPaymentId });
  }
}

