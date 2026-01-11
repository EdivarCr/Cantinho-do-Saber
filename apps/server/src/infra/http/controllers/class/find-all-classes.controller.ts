import { Router, Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { FindAllClassesUseCase } from 'apps/server/src/domain/application/use-cases/class/find-all-classes.use-case';
import { ClassPresenter } from '../../presenters/class.presenter';

@injectable()
export class FindAllClassesController {
  public readonly router: Router;

  constructor(private readonly findAllClassesUseCase: FindAllClassesUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get('/classes', checkJwt, this.handle.bind(this));
  }

  async handle(req: Request, res: Response) {
    const result = await this.findAllClassesUseCase.execute();

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;
      return res.status(500).json({ message });
    }

    const { classes } = result.value;
    return res.status(200).json({ classes: classes.map(ClassPresenter.toHTTP) });
  }
}
