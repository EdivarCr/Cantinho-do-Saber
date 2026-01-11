import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { CreateEnrollmentUseCase } from 'apps/server/src/domain/application/use-cases/finance/create-enrollment.use-case';

const createEnrollmentBodySchema = z.object({
  studentId: z.string(),
  monthlyAmount: z.number().positive(),
  signatureDate: z.string().transform((val) => new Date(val)),
  dueDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});

type CreateEnrollmentBodySchema = z.infer<typeof createEnrollmentBodySchema>;

const bodyValidationPipe = validateBody(createEnrollmentBodySchema);

@injectable()
export class CreateEnrollmentController {
  public readonly router: Router;

  constructor(private readonly createEnrollmentUseCase: CreateEnrollmentUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post('/enrollments', checkJwt, bodyValidationPipe, this.handle.bind(this));
  }

  async handle(req: Request, res: Response) {
    const body = req.body as CreateEnrollmentBodySchema;

    const result = await this.createEnrollmentUseCase.execute(body);

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case CannotCreateError:
          return res.status(400).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    const { enrollmentId } = result.value;
    return res.status(201).json({ enrollmentId });
  }
}
