import { Router, Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { ILessonRepository, LESSON_REPOSITORY_TOKEN } from 'apps/server/src/domain/application/repositories/lesson.repository';
import { LessonPresenter } from '../../presenters/lesson.presenter';
import { inject } from 'tsyringe';

@injectable()
export class FindLessonsByClassController {
  public readonly router: Router;

  constructor(
    @inject(LESSON_REPOSITORY_TOKEN)
    private readonly lessonRepository: ILessonRepository,
  ) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get('/classes/:classId/lessons', checkJwt, this.handle.bind(this));
  }

  async handle(req: Request, res: Response) {
    try {
      const { classId } = req.params;

      if (!classId) {
        return res.status(400).json({ message: 'Class ID is required' });
      }

      const lessons = await this.lessonRepository.findByClassId(classId);

      if (!lessons || lessons.length === 0) {
        return res.status(200).json({ lessons: [] });
      }

      return res.status(200).json({ lessons: lessons.map(LessonPresenter.toHTTP) });
    } catch (error) {
      console.error('Error finding lessons by class:', error);
      return res.status(500).json({ message: 'Failed to retrieve lessons' });
    }
  }
}
