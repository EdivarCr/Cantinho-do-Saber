import { Either, succeed, fail } from 'apps/server/src/core/either';
import { inject, singleton } from 'tsyringe';
import { IPaymentRepository, PAYMENT_REPOSITORY_TOKEN } from '../../repositories/payment.repository';
import { IExpenseRepository, EXPENSE_REPOSITORY_TOKEN } from '../../repositories/expense.repository';
import { IEnrollmentRepository, ENROLLMENT_REPOSITORY_TOKEN } from '../../repositories/enrollment.repository';
import { IStudentRepository, STUDENT_REPOSITORY_TOKEN } from '../../repositories/student.repository';
import { IClassRepository, CLASS_REPOSITORY_TOKEN } from '../../repositories/class.repository';
import { ITeacherRepository, TEACHER_REPOSITORY_TOKEN } from '../../repositories/teacher.repository';
import { ExpenseEntity } from '../../../enterprise/entities/expense.entity';

type ProcessOverduePaymentsResponse = Either<Error, { 
  processedCount: number;
  expensesCreated: number;
}>;

@singleton()
export class ProcessOverduePaymentsUseCase {
  constructor(
    @inject(PAYMENT_REPOSITORY_TOKEN) private paymentRepo: IPaymentRepository,
    @inject(EXPENSE_REPOSITORY_TOKEN) private expenseRepo: IExpenseRepository,
    @inject(ENROLLMENT_REPOSITORY_TOKEN) private enrollmentRepo: IEnrollmentRepository,
    @inject(STUDENT_REPOSITORY_TOKEN) private studentRepo: IStudentRepository,
    @inject(CLASS_REPOSITORY_TOKEN) private classRepo: IClassRepository,
    @inject(TEACHER_REPOSITORY_TOKEN) private teacherRepo: ITeacherRepository,
  ) {}

  async execute(): Promise<ProcessOverduePaymentsResponse> {
    try {
      console.log('[ProcessOverduePayments] Starting process...');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Buscar pagamentos pendentes com vencimento já passou
      const overduePayments = await this.paymentRepo.findOverdue(today);
      console.log('[ProcessOverduePayments] Found overdue payments:', overduePayments.length);

      let expensesCreated = 0;

      for (const payment of overduePayments) {
        // Verificar se já existe despesa para este pagamento
        const existingExpense = await this.expenseRepo.findByPaymentId(payment.id.toString());
        if (existingExpense) {
          console.log(`[ProcessOverduePayments] Expense already exists for payment ${payment.id}`);
          continue;
        }

        // Buscar enrollment → student → class → teacher
        const enrollment = await this.enrollmentRepo.findById(payment.enrollmentId);
        if (!enrollment) {
          console.log(`[ProcessOverduePayments] Enrollment not found for payment ${payment.id}`);
          continue;
        }

        const student = await this.studentRepo.findById(enrollment.studentId);
        if (!student) {
          console.log(`[ProcessOverduePayments] Student not found for enrollment ${enrollment.id}`);
          continue;
        }

        const classEntity = await this.classRepo.findById(student.classId);
        if (!classEntity) {
          console.log(`[ProcessOverduePayments] Class not found for student ${student.id}`);
          continue;
        }

        const teacher = await this.teacherRepo.findById(classEntity.teacherId);
        if (!teacher) {
          console.log(`[ProcessOverduePayments] Teacher not found for class ${classEntity.id}`);
          continue;
        }

        // Calcular valor a pagar ao professor (50% da mensalidade)
        const teacherAmount = payment.amount * 0.50;

        // Criar despesa: Admin pagou do próprio bolso
        const expense = ExpenseEntity.create({
          description: `Adiantamento Prof. ${teacher.name} - Aluno ${student.name} (Mensalidade atrasada)`,
          category: 'ADIANTAMENTO_PROFESSOR',
          amount: teacherAmount,
          dueDate: payment.dueDate,
          paidAt: payment.dueDate, // Admin pagou na data de vencimento
          status: 'PAGO',
          paymentId: payment.id.toString(), // Vincular ao pagamento
        });

        const created = await this.expenseRepo.create(expense);
        if (created) {
          expensesCreated++;
          console.log(`[ProcessOverduePayments] Created expense for payment ${payment.id}: R$ ${teacherAmount}`);
        } else {
          console.error(`[ProcessOverduePayments] Failed to create expense for payment ${payment.id}`);
        }
      }

      console.log('[ProcessOverduePayments] Process completed.');
      console.log(`[ProcessOverduePayments] Processed: ${overduePayments.length} payments`);
      console.log(`[ProcessOverduePayments] Created: ${expensesCreated} expenses`);

      return succeed({
        processedCount: overduePayments.length,
        expensesCreated,
      });
    } catch (error) {
      console.error('[ProcessOverduePayments] Error:', error);
      return fail(new Error('Failed to process overdue payments'));
    }
  }
}
