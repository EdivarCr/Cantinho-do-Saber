import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { CreateClassUseCase } from 'apps/server/src/domain/application/use-cases/class/create-class.use-case';
import { Shift } from 'apps/server/src/core/types/school-enums';

const createClassBodySchema = z.object({
  name: z.string(),
  teacherId: z.string(),
  shift: z.enum(Shift),
  // Removido: grades - vem do professor
});

type CreateClassBodySchema = z.infer<typeof createClassBodySchema>;

const bodyValidationPipe = validateBody(createClassBodySchema);

@injectable()
export class CreateClassController {
  public readonly router: Router;

  constructor(private readonly createClassUseCase: CreateClassUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post('/class', checkJwt, bodyValidationPipe, this.handle.bind(this));
  }

  async handle(req: Request, res: Response) {
    try {
      console.log('[CreateClassController] ========== START ==========');
      console.log('[CreateClassController] Request body:', JSON.stringify(req.body, null, 2));

      const body = req.body as CreateClassBodySchema;

      const { name, teacherId, shift } = body;

      console.log('[CreateClassController] Parsed data:', { name, teacherId, shift });

      const result = await this.createClassUseCase.execute({
        name,
        teacherId,
        shift,
      });

      if (result.isFail()) {
        const exception = result.value;
        const message = exception.message;

        console.error('[CreateClassController] ❌ Use case FAILED:', exception);

        switch (exception.constructor) {
          case ResourceNotFoundError:
            return res.status(404).json({ message });
          case CannotCreateError:
            return res.status(400).json({ message });
          default:
            return res.status(500).json({ message });
        }
      }

      const { classId } = result.value;

      console.log('[CreateClassController] ✅ SUCCESS - Class ID:', classId);
      console.log('[CreateClassController] ========== END ==========');

      return res.status(201).json({ 
        message: 'Class created successfully',
        classId 
      });
    } catch (error) {
      console.error('[CreateClassController] ❌ EXCEPTION:', error);
      return res.status(500).json({ 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
