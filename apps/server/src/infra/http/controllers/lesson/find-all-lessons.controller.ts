import { Router, Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { FindAllLessonsUseCase } from 'apps/server/src/domain/application/use-cases/lesson/find-all-lessons.use-case';
import { LessonPresenter } from '../../presenters/lesson.presenter';

@injectable()
export class FindAllLessonsController {
  public readonly router: Router;

  constructor(private readonly findAllLessonsUseCase: FindAllLessonsUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get('/lessons', checkJwt, this.handle.bind(this));
  }

  async handle(req: Request, res: Response) {
    const result = await this.findAllLessonsUseCase.execute();

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;
      return res.status(500).json({ message });
    }

    const { lessons } = result.value;
    return res.status(200).json({ lessons: lessons.map(LessonPresenter.toHTTP) });
  }
}
