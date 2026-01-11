import { ITeacherPaymentRepository } from 'apps/server/src/domain/application/repositories/teacher-payment.repository';
import { TeacherPaymentEntity } from 'apps/server/src/domain/enterprise/entities/teacher-payment.entity';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';
import { TeacherPaymentMapper } from '../mapper/teacher-payment.mapper';
import { TeacherPaymentSchema } from '../schemas/teacher-payment.schema';

@singleton()
export class TeacherPaymentRepository implements ITeacherPaymentRepository {
  async create(teacherPayment: TeacherPaymentEntity): Promise<boolean> {
    try {
      const raw = TeacherPaymentMapper.toDatabase(teacherPayment);
      await prisma.teacherPayment.create({ data: raw });
      return true;
    } catch (error) {
      console.error('[TeacherPaymentRepository] Error creating teacher payment:', error);
      return false;
    }
  }

  async findById(id: string): Promise<TeacherPaymentEntity | null> {
    const teacherPayment = await prisma.teacherPayment.findUnique({
      where: { id },
      include: { teacher: true },
    });
    if (!teacherPayment || teacherPayment.deletedAt) return null;
    return TeacherPaymentMapper.toDomain(teacherPayment as TeacherPaymentSchema);
  }

  async findByTeacherId(teacherId: string): Promise<TeacherPaymentEntity[]> {
    const teacherPayments = await prisma.teacherPayment.findMany({
      where: { teacherId, deletedAt: null },
      include: { teacher: true },
    });
    return teacherPayments.map((tp) => TeacherPaymentMapper.toDomain(tp as TeacherPaymentSchema));
  }

  async findByMonth(month: string): Promise<TeacherPaymentEntity[]> {
    const teacherPayments = await prisma.teacherPayment.findMany({
      where: { month, deletedAt: null },
      include: { teacher: true },
    });
    return teacherPayments.map((tp) => TeacherPaymentMapper.toDomain(tp as TeacherPaymentSchema));
  }

  async findByTeacherIdAndMonth(teacherId: string, month: string): Promise<TeacherPaymentEntity | null> {
    const teacherPayment = await prisma.teacherPayment.findUnique({
      where: {
        teacherId_month: { teacherId, month },
      },
      include: { teacher: true },
    });
    if (!teacherPayment || teacherPayment.deletedAt) return null;
    return TeacherPaymentMapper.toDomain(teacherPayment as TeacherPaymentSchema);
  }

  async upsert(teacherPayment: TeacherPaymentEntity): Promise<boolean> {
    try {
      const raw = TeacherPaymentMapper.toDatabase(teacherPayment);
      await prisma.teacherPayment.upsert({
        where: {
          teacherId_month: {
            teacherId: raw.teacherId,
            month: raw.month,
          },
        },
        update: raw,
        create: raw,
      });
      return true;
    } catch (error) {
      console.error('[TeacherPaymentRepository] Error upserting teacher payment:', error);
      return false;
    }
  }

  async update(teacherPayment: TeacherPaymentEntity): Promise<boolean> {
    try {
      const raw = TeacherPaymentMapper.toDatabase(teacherPayment);
      await prisma.teacherPayment.update({
        where: { id: raw.id },
        data: raw,
      });
      return true;
    } catch (error) {
      console.error('[TeacherPaymentRepository] Error updating teacher payment:', error);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.teacherPayment.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch (error) {
      console.error('[TeacherPaymentRepository] Error deleting teacher payment:', error);
      return false;
    }
  }
}
