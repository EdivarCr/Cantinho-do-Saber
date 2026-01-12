import { Router, Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { z } from 'zod';
import { checkJwt, requireAnyRole } from '../../../auth/auth.middleware';
import { GetAttendancesByLessonUseCase } from 'apps/server/src/domain/application/use-cases/attendance/get-attendances-by-lesson.use-case';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { AttendancePresenter } from '../../presenters/attendance.presenter';

const lessonIdParamSchema = z.object({
  lessonId: z.string().min(1),
});

@injectable()
export class GetAttendancesByLessonController {
  public readonly router: Router;

  constructor(private readonly getAttendancesByLessonUseCase: GetAttendancesByLessonUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get(
      '/lessons/:lessonId/attendances',
      checkJwt,
      requireAnyRole(['PROFESSOR', 'ADMIN', 'COMUM']),
      this.handle.bind(this),
    );
  }

  async handle(req: Request, res: Response) {
    const paramsValidation = lessonIdParamSchema.safeParse(req.params);

    if (!paramsValidation.success) {
      return res.status(400).json({ message: 'Invalid lessonId' });
    }

    const { lessonId } = paramsValidation.data;

    const result = await this.getAttendancesByLessonUseCase.execute({ lessonId });

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

    const { attendances } = result.value;
    return res.status(200).json({ attendances: attendances.map(AttendancePresenter.toHTTP) });
  }
}

