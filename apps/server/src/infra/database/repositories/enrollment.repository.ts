import { IEnrollmentRepository } from 'apps/server/src/domain/application/repositories/enrollment.repository';
import { EnrollmentEntity } from 'apps/server/src/domain/enterprise/entities/enrollment.entity';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';
import { EnrollmentMapper } from '../mapper/enrollment.mapper';
import { EnrollmentSchema } from '../schemas/enrollment.schema';

@singleton()
export class EnrollmentRepository implements IEnrollmentRepository {
  async create(enrollment: EnrollmentEntity): Promise<boolean> {
    try {
      const raw = EnrollmentMapper.toDatabase(enrollment);
      await prisma.enrollment.create({ data: raw });
      return true;
    } catch (error) {
      console.error('[EnrollmentRepository] Error creating enrollment:', error);
      return false;
    }
  }

  async findById(id: string): Promise<EnrollmentEntity | null> {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: { student: true, contract: true, payments: true },
    });
    if (!enrollment || enrollment.deletedAt) return null;
    return EnrollmentMapper.toDomain(enrollment as EnrollmentSchema);
  }

  async findByStudentId(studentId: string): Promise<EnrollmentEntity | null> {
    const enrollment = await prisma.enrollment.findFirst({
      where: { studentId, deletedAt: null },
      include: { student: true, contract: true, payments: true },
    });
    if (!enrollment) return null;
    return EnrollmentMapper.toDomain(enrollment as EnrollmentSchema);
  }

  async update(enrollment: EnrollmentEntity): Promise<boolean> {
    try {
      const raw = EnrollmentMapper.toDatabase(enrollment);
      await prisma.enrollment.update({
        where: { id: raw.id },
        data: raw,
      });
      return true;
    } catch (error) {
      console.error('[EnrollmentRepository] Error updating enrollment:', error);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.enrollment.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch (error) {
      console.error('[EnrollmentRepository] Error deleting enrollment:', error);
      return false;
    }
  }
}
