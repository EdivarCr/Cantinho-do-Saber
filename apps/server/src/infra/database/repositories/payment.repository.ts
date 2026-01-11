import { IPaymentRepository } from 'apps/server/src/domain/application/repositories/payment.repository';
import { PaymentEntity } from 'apps/server/src/domain/enterprise/entities/payment.entity';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';
import { PaymentMapper } from '../mapper/payment.mapper';
import { PaymentSchema } from '../schemas/payment.schema';

@singleton()
export class PaymentRepository implements IPaymentRepository {
  async create(payment: PaymentEntity): Promise<boolean> {
    try {
      const raw = PaymentMapper.toDatabase(payment);
      await prisma.payment.create({ data: raw });
      return true;
    } catch (error) {
      console.error('[PaymentRepository] Error creating payment:', error);
      return false;
    }
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { enrollment: true },
    });
    if (!payment || payment.deletedAt) return null;
    return PaymentMapper.toDomain(payment as PaymentSchema);
  }

  async findByEnrollmentId(enrollmentId: string): Promise<PaymentEntity[]> {
    const payments = await prisma.payment.findMany({
      where: { enrollmentId, deletedAt: null },
      include: { enrollment: true },
    });
    return payments.map((p) => PaymentMapper.toDomain(p as PaymentSchema));
  }

  async findByMonth(month: string): Promise<PaymentEntity[]> {
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59);

    const payments = await prisma.payment.findMany({
      where: {
        dueDate: { gte: startDate, lte: endDate },
        deletedAt: null,
      },
      include: { enrollment: { include: { student: true } } },
    });
    return payments.map((p) => PaymentMapper.toDomain(p as PaymentSchema));
  }

  async findByStudentIds(studentIds: string[], month: string): Promise<PaymentEntity[]> {
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59);

    const payments = await prisma.payment.findMany({
      where: {
        enrollment: {
          studentId: { in: studentIds },
        },
        dueDate: { gte: startDate, lte: endDate },
        deletedAt: null,
      },
      include: { enrollment: true },
    });
    return payments.map((p) => PaymentMapper.toDomain(p as PaymentSchema));
  }

  async update(payment: PaymentEntity): Promise<boolean> {
    try {
      const raw = PaymentMapper.toDatabase(payment);
      await prisma.payment.update({
        where: { id: raw.id },
        data: raw,
      });
      return true;
    } catch (error) {
      console.error('[PaymentRepository] Error updating payment:', error);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.payment.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch (error) {
      console.error('[PaymentRepository] Error deleting payment:', error);
      return false;
    }
  }
}
