import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { inject, singleton } from 'tsyringe';
import {
  PAYMENT_REPOSITORY_TOKEN,
  IPaymentRepository,
} from '../../repositories/payment.repository';
import {
  EXPENSE_REPOSITORY_TOKEN,
  IExpenseRepository,
} from '../../repositories/expense.repository';
import { ExpenseEntity } from '../../../enterprise/entities/expense.entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';

type AdvancePaymentForTeacherRequest = {
  paymentId: string;
  paymentDate: Date;
  paymentMethod: string;
  teacherName: string;
  studentName: string;
};

type AdvancePaymentForTeacherResponse = Either<
  ResourceNotFoundError | Error,
  { paymentId: string; expenseId: string }
>;

/**
 * Use case para quando o admin paga do bolso a mensalidade do aluno
 * para garantir o pagamento do professor.
 *
 * 1. Marca o pagamento do aluno como PAGO
 * 2. Cria uma despesa do tipo ADIANTAMENTO_PROFESSOR
 */
@singleton()
export class AdvancePaymentForTeacherUseCase {
  constructor(
    @inject(PAYMENT_REPOSITORY_TOKEN) private paymentRepo: IPaymentRepository,
    @inject(EXPENSE_REPOSITORY_TOKEN) private expenseRepo: IExpenseRepository,
  ) {}

  async execute(
    request: AdvancePaymentForTeacherRequest,
  ): Promise<AdvancePaymentForTeacherResponse> {
    try {
      console.log(
        '[AdvancePaymentForTeacherUseCase] Processing advance payment:',
        request.paymentId,
      );

      const payment = await this.paymentRepo.findById(request.paymentId);
      if (!payment) {
        console.error('[AdvancePaymentForTeacherUseCase] Payment not found');
        return fail(new ResourceNotFoundError('Payment'));
      }

      // Marca o pagamento como PAGO (adiantado pelo admin)
      payment.paymentDate = request.paymentDate;
      payment.paymentMethod = request.paymentMethod;
      payment.status = 'PAGO';

      const updated = await this.paymentRepo.update(payment);
      if (!updated) {
        console.error('[AdvancePaymentForTeacherUseCase] Failed to update payment');
        return fail(new Error('Failed to update payment'));
      }

      // Cria uma despesa de adiantamento
      const expenseId = new UniqueEntityId();
      const expense = ExpenseEntity.create(
        {
          description: `Adiantamento p/ professor ${request.teacherName} - Aluno ${request.studentName} (${payment.dueDate.toLocaleDateString('pt-BR')})`,
          category: 'ADIANTAMENTO_PROFESSOR',
          amount: payment.amount,
          dueDate: request.paymentDate,
          paidAt: request.paymentDate,
          status: 'PAGO',
          paymentId: payment.id.toString(),
        },
        expenseId,
      );

      const expenseCreated = await this.expenseRepo.create(expense);
      if (!expenseCreated) {
        console.error('[AdvancePaymentForTeacherUseCase] Failed to create expense');
        return fail(new Error('Failed to create expense'));
      }

      console.log('[AdvancePaymentForTeacherUseCase] Advance payment recorded successfully');
      return succeed({
        paymentId: payment.id.toString(),
        expenseId: expenseId.toString(),
      });
    } catch (error) {
      console.error('[AdvancePaymentForTeacherUseCase] Error:', error);
      return fail(new Error('Cannot process advance payment: ' + (error as Error).message));
    }
  }
}

