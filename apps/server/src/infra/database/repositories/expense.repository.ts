import { IExpenseRepository } from 'apps/server/src/domain/application/repositories/expense.repository';
import { ExpenseEntity } from 'apps/server/src/domain/enterprise/entities/expense.entity';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';
import { ExpenseMapper } from '../mapper/expense.mapper';
import { ExpenseSchema } from '../schemas/expense.schema';

@singleton()
export class ExpenseRepository implements IExpenseRepository {
  async create(expense: ExpenseEntity): Promise<boolean> {
    try {
      const raw = ExpenseMapper.toDatabase(expense);
      await prisma.expense.create({ data: raw });
      return true;
    } catch (error) {
      console.error('[ExpenseRepository] Error creating expense:', error);
      return false;
    }
  }

  async findById(id: string): Promise<ExpenseEntity | null> {
    const expense = await prisma.expense.findUnique({
      where: { id },
    });
    if (!expense || expense.deletedAt) return null;
    return ExpenseMapper.toDomain(expense as ExpenseSchema);
  }

  async findByMonth(month: string): Promise<ExpenseEntity[]> {
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59);

    const expenses = await prisma.expense.findMany({
      where: {
        dueDate: { gte: startDate, lte: endDate },
        deletedAt: null,
      },
    });
    return expenses.map((e) => ExpenseMapper.toDomain(e as ExpenseSchema));
  }

  async findByPaymentId(paymentId: string): Promise<ExpenseEntity | null> {
    const expense = await prisma.expense.findFirst({
      where: { 
        paymentId,
        deletedAt: null,
      },
    });
    if (!expense) return null;
    return ExpenseMapper.toDomain(expense as ExpenseSchema);
  }

  async update(expense: ExpenseEntity): Promise<boolean> {
    try {
      const raw = ExpenseMapper.toDatabase(expense);
      await prisma.expense.update({
        where: { id: raw.id },
        data: raw,
      });
      return true;
    } catch (error) {
      console.error('[ExpenseRepository] Error updating expense:', error);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.expense.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch (error) {
      console.error('[ExpenseRepository] Error deleting expense:', error);
      return false;
    }
  }
}
