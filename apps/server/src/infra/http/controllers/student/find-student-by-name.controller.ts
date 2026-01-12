import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { FindStudentByNameUseCase } from 'apps/server/src/domain/application/use-cases/student/find-student-by-name.use-case';
import { StudentPresenter } from '../../presenters/student.presenter';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';

// GET requests validam query params, não body
// Permite string vazia para listar todos os alunos
const findStudentByNameQuerySchema = z.object({
  studentName: z.string().min(0).default(''),
});

type FindStudentQuerySchema = z.infer<typeof findStudentByNameQuerySchema>;

@injectable()
export class FindStudentByNameController {
  public readonly router: Router;

  constructor(private readonly findStudentByNameStudentUseCase: FindStudentByNameUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    // Rota corrigida para plural e sem conflito com ID
    this.router.get('/students/search', checkJwt, this.handle.bind(this));
  }

  async handle(req: Request, res: Response) {
    try {
      console.log('[FindStudentByNameController] Request query:', req.query);

      const queryValidation = findStudentByNameQuerySchema.safeParse(req.query);

      if (!queryValidation.success) {
        console.error('[FindStudentByNameController] Validation failed:', queryValidation.error);
        return res.status(400).json({ message: 'Invalid search query' });
      }

      const { studentName } = queryValidation.data;
      console.log('[FindStudentByNameController] Searching for name:', studentName);

      const result = await this.findStudentByNameStudentUseCase.execute({ studentName });

      if (result.isFail()) {
        const exception = result.value;
        const message = exception.message;

        console.error('[FindStudentByNameController] Use case failed:', exception);

        switch (exception.constructor) {
          case ResourceNotFoundError:
            return res.status(404).json({ message });
          default:
            return res.status(500).json({ message });
        }
      }

      const { students } = result.value;
      console.log('[FindStudentByNameController] Found students:', students.length);

      return res.status(200).json(students.map(StudentPresenter.toHTTP));
    } catch (error) {
      console.error('[FindStudentByNameController] Error:', error);
      return res.status(500).json({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
