import { ILessonRepository, LESSON_REPOSITORY_TOKEN } from '../../repositories/lesson.repository';
import { Either, fail, succeed } from 'apps/server/src/core/either';
import { LessonEntity } from '../../../enterprise/entities/lesson.entity';
import { inject, singleton } from 'tsyringe';

type FindAllLessonsUseCaseResponse = Either<Error, { lessons: LessonEntity[] }>;

@singleton()
export class FindAllLessonsUseCase {
  constructor(
    @inject(LESSON_REPOSITORY_TOKEN)
    private readonly lessonRepository: ILessonRepository,
  ) {}

  async execute(): Promise<FindAllLessonsUseCaseResponse> {
    try {
      const lessons = await this.lessonRepository.findAll();
      return succeed({ lessons });
    } catch (error) {
      return fail(new Error('Lessons could not be retrieved due to error: ' + error));
    }
  }
}
