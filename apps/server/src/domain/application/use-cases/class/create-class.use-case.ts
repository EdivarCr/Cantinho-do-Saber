import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { inject, singleton } from 'tsyringe';
import { ClassEntity } from '../../../enterprise/entities/class.entity';
import { CLASS_REPOSITORY_TOKEN, IClassRepository } from '../../repositories/class.repository';
import { TEACHER_REPOSITORY_TOKEN, ITeacherRepository } from '../../repositories/teacher.repository';
import { Shift } from 'apps/server/src/core/types/school-enums';

type CreateClassUseCaseRequest = {
  name: string;
  teacherId: string;
  shift: Shift;
  // Removido: grades - vem do professor

  studentIds?: string[] | null;
  lessonIds?: string[] | null;
};

type CreateClassUseCaseResponse = Either<CannotCreateError | ResourceNotFoundError, { classId: string }>;

@singleton()
export class CreateClassUseCase {
  constructor(
    @inject(CLASS_REPOSITORY_TOKEN)
    private readonly classRepository: IClassRepository,
    @inject(TEACHER_REPOSITORY_TOKEN)
    private readonly teacherRepository: ITeacherRepository,
  ) {}

  async execute({
    name,
    teacherId,
    shift,
    studentIds = null,
    lessonIds = null,
  }: CreateClassUseCaseRequest): Promise<CreateClassUseCaseResponse> {
    try {
      // Validar se professor existe e pegar suas qualifiedGrades
      const teacher = await this.teacherRepository.findById(teacherId);
      if (!teacher) return fail(new ResourceNotFoundError('Teacher'));

      console.log(`[CreateClassUseCase] Teacher ${teacher.name} qualifiedGrades:`, teacher.qualifiedGrades);

      const classEntity = ClassEntity.create({
        name,
        teacherId,
        shift,
        // grades herdam do professor automaticamente
        studentIds,
        lessonIds,
      });

      const canCreateClass = await this.classRepository.create(classEntity);

      if (!canCreateClass) {
        return fail(new CannotCreateError('Class'));
      }

      return succeed({ classId: classEntity.id.toString() });
    } catch (error) {
      console.error('[CreateClassUseCase] Error:', error);
      return fail(new Error('Cannot create Class due to error: ' + error));
    }
  }
}
