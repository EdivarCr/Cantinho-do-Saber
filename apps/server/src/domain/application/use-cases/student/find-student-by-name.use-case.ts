import {
  IStudentRepository,
  STUDENT_REPOSITORY_TOKEN,
} from '../../repositories/student.repository';
import { Either, fail, succeed } from 'apps/server/src/core/either';
import { StudentEntity } from '../../../enterprise/entities/student.entity';
import { inject, singleton } from 'tsyringe';

type FindStudentByNameUseCaseRequest = {
  studentName: string;
};

type FindStudentByNameUseCaseResponse = Either<Error, { students: StudentEntity[] }>;

@singleton()
export class FindStudentByNameUseCase {
  constructor(
    @inject(STUDENT_REPOSITORY_TOKEN)
    private readonly studentRepository: IStudentRepository,
  ) {}

  async execute({
    studentName,
  }: FindStudentByNameUseCaseRequest): Promise<FindStudentByNameUseCaseResponse> {
    try {
      console.log(`[FindStudentByNameUseCase] Searching for students with name: "${studentName}"`);
      const students = await this.studentRepository.findByName(studentName);
      console.log(`[FindStudentByNameUseCase] Found ${students.length} students`);

      return succeed({ students: students });
    } catch (error) {
      console.error('[FindStudentByNameUseCase] Error:', error);
      return fail(new Error('Cannot fetch students due to error: ' + error));
    }
  }
}
