import { IClassRepository, CLASS_REPOSITORY_TOKEN } from '../../repositories/class.repository';
import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ClassEntity } from '../../../enterprise/entities/class.entity';
import { inject, singleton } from 'tsyringe';

type FindAllClassesUseCaseResponse = Either<Error, { classes: ClassEntity[] }>;

@singleton()
export class FindAllClassesUseCase {
  constructor(
    @inject(CLASS_REPOSITORY_TOKEN)
    private readonly classRepository: IClassRepository,
  ) {}

  async execute(): Promise<FindAllClassesUseCaseResponse> {
    try {
      const classes = await this.classRepository.findAll();
      return succeed({ classes });
    } catch (error) {
      return fail(new Error('Classes could not be retrieved due to error: ' + error));
    }
  }
}
