import { inject, injectable } from 'tsyringe';
import { Either, fail, succeed } from 'apps/server/src/core/either';
import {
  IAttendanceRepository,
  ATTENDANCE_REPOSITORY_TOKEN,
} from '../../repositories/attendance.repository';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { ILessonRepository, LESSON_REPOSITORY_TOKEN } from '../../repositories/lesson.repository';
import { AttendanceEntity } from 'apps/server/src/domain/enterprise/entities/attendance.entity';
import { prisma } from 'packages/database/src/client';
import { AttendanceMapper } from 'apps/server/src/infra/database/mapper/attendance.mapper';
import { AttendanceSchema } from 'apps/server/src/infra/database/schemas/attendance.schema';

interface GetAttendancesByLessonRequest {
  lessonId: string;
}

type GetAttendancesByLessonResponse = Either<
  ResourceNotFoundError,
  { attendances: AttendanceEntity[] }
>;

@injectable()
export class GetAttendancesByLessonUseCase {
  constructor(
    @inject(LESSON_REPOSITORY_TOKEN)
    private readonly lessonRepository: ILessonRepository,
  ) {}

  async execute(request: GetAttendancesByLessonRequest): Promise<GetAttendancesByLessonResponse> {
    const { lessonId } = request;

    // Verify lesson exists
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      return fail(new ResourceNotFoundError('Aula não encontrada'));
    }

    // Get attendances for lesson
    const records = await prisma.attendance.findMany({
      where: { lessonId, deletedAt: null },
      include: { student: true },
    });

    const attendances = records.map((r) => AttendanceMapper.toDomain(r as AttendanceSchema));

    return succeed({ attendances });
  }
}

