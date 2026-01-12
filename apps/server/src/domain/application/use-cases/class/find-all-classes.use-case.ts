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
      console.log('[FindAllClassesUseCase] Fetching all classes from repository...');
      const classes = await this.classRepository.findAll();
      console.log(`[FindAllClassesUseCase] Retrieved ${classes.length} classes`);
      return succeed({ classes });
    } catch (error) {
      console.error('[FindAllClassesUseCase] Error:', error);
      return fail(new Error('Classes could not be retrieved due to error: ' + error));
    }
  }
}
