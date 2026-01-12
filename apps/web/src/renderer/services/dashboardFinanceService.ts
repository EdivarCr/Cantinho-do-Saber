// ============================================================================
// SERVIÇO DE DADOS FINANCEIROS DO DASHBOARD
// Integra dados de pagamentos via API
// ============================================================================

import { api } from './api';
import { studentService, Student } from './studentService';
import { teacherService, Teacher } from './teacherService';
import { classService, Class } from './classService';
import {
  pricingService,
  calculateTeacherPayment,
  formatCurrency,
  TEACHER_PARTICIPATION_RATE,
} from './pricingService';

// ============================================================================
// INTERFACES
// ============================================================================

export interface TeacherPaymentSummary {
  teacherPaymentId: string;
  teacherId: string;
  teacherName: string;
  totalStudents: number;
  totalRevenue: number;
  amountToPay: number;
  status: 'PENDENTE' | 'PAGO';
  paidAt?: string;
  paymentMethod?: PaymentMethod;
}

export interface MonthlyFeeSummary {
  paymentId: string;
  studentId: string;
  studentName: string;
  className: string;
  teacherName: string;
  monthlyFee: number;
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO';
  dueDate: string;
  paidAt?: string;
  paymentMethod?: PaymentMethod;
  overdueMonths?: string[];
}

export interface DashboardFinanceSummary {
  totalMonthlyFees: number;
  paidMonthlyFees: number;
  pendingMonthlyFees: number;
  overdueMonthlyFees: number;
  totalTeacherPayments: number;
  paidTeacherPayments: number;
  pendingTeacherPayments: number;
  netProfit: number;
  teacherPayments: TeacherPaymentSummary[];
  studentPayments: MonthlyFeeSummary[];
}

export type PaymentMethod = 'PIX' | 'DINHEIRO' | 'MISTO';

// ============================================================================
// INTERFACES FROM BACKEND
// ============================================================================

interface PaymentFromBackend {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  amount: number;
  dueDate: string;
  paymentDate: string | null;
  status: string;
  paymentMethod: string | null;
  enrollmentId: string;
}

interface TeacherPaymentFromBackend {
  id: string;
  teacherId: string;
  teacherName: string;
  month: string;
  activeStudents: number;
  totalContracts: number;
  participationRate: number;
  realizedRevenue: number;
  amountToPay: number;
  status: string;
  paidAt: string | null;
  paymentMethod: string | null;
}

// ============================================================================
// SERVIÇO
// ============================================================================

export const dashboardFinanceService = {
  /**
   * Obtém o resumo financeiro para o dashboard
   * @param month Mês no formato YYYY-MM (opcional, padrão: mês atual)
   */
  async getFinanceSummary(month?: string): Promise<DashboardFinanceSummary> {
    const targetMonth = month || this.getCurrentMonth();

    // Carrega dados de alunos, professores e turmas para fallback
    const [students, teachers, classes] = await Promise.all([
      studentService.getAll(),
      teacherService.getAll(),
      classService.getAll(),
    ]);

    // Tenta buscar pagamentos do backend
    let paymentsFromApi: PaymentFromBackend[] = [];
    let teacherPaymentsFromApi: TeacherPaymentFromBackend[] = [];

    try {
      const { data: paymentsData } = await api.get<{ payments: PaymentFromBackend[] }>(
        `/payments/month/${targetMonth}`,
      );
      paymentsFromApi = paymentsData.payments || [];
    } catch (error) {
      console.log('[dashboardFinanceService] Payments API not available, using calculated data');
    }

    try {
      const { data: teacherPaymentsData } = await api.get<{
        teacherPayments: TeacherPaymentFromBackend[];
      }>(`/teacher-payments/month/${targetMonth}`);
      teacherPaymentsFromApi = teacherPaymentsData.teacherPayments || [];
    } catch (error) {
      console.log(
        '[dashboardFinanceService] Teacher payments API not available, using calculated data',
      );
    }

    // Se temos dados da API, use-os
    if (paymentsFromApi.length > 0) {
      return this.buildSummaryFromApi(
        paymentsFromApi,
        teacherPaymentsFromApi,
        teachers,
        targetMonth,
      );
    }

    // Fallback: calcula com base nos alunos cadastrados
    return this.buildSummaryFromStudents(students, teachers, classes, targetMonth);
  },

  /**
   * Constrói resumo a partir dos dados da API
   */
  buildSummaryFromApi(
    payments: PaymentFromBackend[],
    teacherPayments: TeacherPaymentFromBackend[],
    teachers: Teacher[],
    targetMonth: string,
  ): DashboardFinanceSummary {
    // Converte pagamentos de alunos
    const studentPayments: MonthlyFeeSummary[] = payments.map((p) => ({
      paymentId: p.id,
      studentId: p.studentId,
      studentName: p.studentName,
      className: p.className,
      teacherName: '', // Não retornado pela API
      monthlyFee: p.amount,
      status: p.status as 'PENDENTE' | 'PAGO' | 'ATRASADO',
      dueDate: p.dueDate,
      paidAt: p.paymentDate || undefined,
      paymentMethod: (p.paymentMethod as PaymentMethod) || undefined,
    }));

    // Converte pagamentos de professores
    const teacherPaymentsSummary: TeacherPaymentSummary[] = teacherPayments.map((tp) => ({
      teacherPaymentId: tp.id,
      teacherId: tp.teacherId,
      teacherName: tp.teacherName,
      totalStudents: tp.activeStudents,
      totalRevenue: tp.realizedRevenue,
      amountToPay: tp.amountToPay,
      status: tp.status === 'PAGO' ? 'PAGO' : 'PENDENTE',
      paidAt: tp.paidAt || undefined,
      paymentMethod: (tp.paymentMethod as PaymentMethod) || undefined,
    }));

    // Calcula totais
    const totalMonthlyFees = studentPayments.reduce((sum, p) => sum + p.monthlyFee, 0);
    const paidMonthlyFees = studentPayments
      .filter((p) => p.status === 'PAGO')
      .reduce((sum, p) => sum + p.monthlyFee, 0);
    const pendingMonthlyFees = studentPayments
      .filter((p) => p.status === 'PENDENTE')
      .reduce((sum, p) => sum + p.monthlyFee, 0);
    const overdueMonthlyFees = studentPayments
      .filter((p) => p.status === 'ATRASADO')
      .reduce((sum, p) => sum + p.monthlyFee, 0);

    const totalTeacherPayments = teacherPaymentsSummary.reduce((sum, p) => sum + p.amountToPay, 0);
    const paidTeacherPayments = teacherPaymentsSummary
      .filter((p) => p.status === 'PAGO')
      .reduce((sum, p) => sum + p.amountToPay, 0);
    const pendingTeacherPayments = teacherPaymentsSummary
      .filter((p) => p.status === 'PENDENTE')
      .reduce((sum, p) => sum + p.amountToPay, 0);

    const netProfit = paidMonthlyFees - paidTeacherPayments;

    return {
      totalMonthlyFees,
      paidMonthlyFees,
      pendingMonthlyFees,
      overdueMonthlyFees,
      totalTeacherPayments,
      paidTeacherPayments,
      pendingTeacherPayments,
      netProfit,
      teacherPayments: teacherPaymentsSummary,
      studentPayments,
    };
  },

  /**
   * Constrói resumo a partir dos alunos cadastrados (fallback)
   */
  buildSummaryFromStudents(
    students: Student[],
    teachers: Teacher[],
    classes: Class[],
    targetMonth: string,
  ): DashboardFinanceSummary {
    const activeStudents = students.filter((s) => s.status === 'active');

    // Filtra alunos matriculados no mês
    const enrolledStudentsForMonth = activeStudents.filter((student) => {
      if (!student.enrollmentDate) return true;
      const enrollmentDate = new Date(student.enrollmentDate);
      const enrollmentMonth = `${enrollmentDate.getFullYear()}-${String(enrollmentDate.getMonth() + 1).padStart(2, '0')}`;
      return enrollmentMonth <= targetMonth;
    });

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const isPastMonth = targetMonth < currentMonth;

    // Calcula mensalidades dos alunos
    const studentPayments: MonthlyFeeSummary[] = enrolledStudentsForMonth.map((student) => {
      const cls = classes.find((c) => c.id === student.class || c.name === student.class);
      const teacher = teachers.find((t) => t.id === student.teacher || t.nome === student.teacher);

      // Status padrão baseado na data
      let status: 'PENDENTE' | 'PAGO' | 'ATRASADO' = 'PENDENTE';
      if (isPastMonth || (targetMonth === currentMonth && now.getDate() > 10)) {
        status = 'ATRASADO';
      }

      return {
        paymentId: '', // Fallback não tem ID real
        studentId: student.id,
        studentName: student.name,
        className: cls?.name || student.class || 'Sem turma',
        teacherName: teacher?.nome || student.teacher || 'Sem professor',
        monthlyFee: student.monthlyFee || 0,
        status,
        dueDate: this.getMonthDueDate(targetMonth),
      };
    });

    // Agrupa alunos por professor
    const teacherStudentMap = new Map<string, { teacher: Teacher; students: Student[] }>();

    for (const student of enrolledStudentsForMonth) {
      const cls = classes.find((c) => c.id === student.class || c.name === student.class);
      const teacherId = cls?.teacherId || student.teacher;
      const teacher = teachers.find((t) => t.id === teacherId || t.nome === teacherId);

      if (teacher) {
        const existing = teacherStudentMap.get(teacher.id);
        if (existing) {
          existing.students.push(student);
        } else {
          teacherStudentMap.set(teacher.id, { teacher, students: [student] });
        }
      }
    }

    // Cria resumo de pagamentos de professores
    const teacherPaymentsSummary: TeacherPaymentSummary[] = [];

    teacherStudentMap.forEach(({ teacher, students: teacherStudents }) => {
      const totalRevenue = teacherStudents.reduce((sum, s) => sum + (s.monthlyFee || 0), 0);
      const amountToPay = Math.round(totalRevenue * TEACHER_PARTICIPATION_RATE);

      teacherPaymentsSummary.push({
        teacherPaymentId: '', // Fallback não tem ID real
        teacherId: teacher.id,
        teacherName: teacher.nome,
        totalStudents: teacherStudents.length,
        totalRevenue,
        amountToPay,
        status: 'PENDENTE',
      });
    });

    // Calcula totais
    const totalMonthlyFees = studentPayments.reduce((sum, p) => sum + p.monthlyFee, 0);
    const paidMonthlyFees = studentPayments
      .filter((p) => p.status === 'PAGO')
      .reduce((sum, p) => sum + p.monthlyFee, 0);
    const pendingMonthlyFees = studentPayments
      .filter((p) => p.status === 'PENDENTE')
      .reduce((sum, p) => sum + p.monthlyFee, 0);
    const overdueMonthlyFees = studentPayments
      .filter((p) => p.status === 'ATRASADO')
      .reduce((sum, p) => sum + p.monthlyFee, 0);

    const totalTeacherPayments = teacherPaymentsSummary.reduce((sum, p) => sum + p.amountToPay, 0);
    const paidTeacherPayments = 0;
    const pendingTeacherPayments = totalTeacherPayments;

    const netProfit = paidMonthlyFees - paidTeacherPayments;

    return {
      totalMonthlyFees,
      paidMonthlyFees,
      pendingMonthlyFees,
      overdueMonthlyFees,
      totalTeacherPayments,
      paidTeacherPayments,
      pendingTeacherPayments,
      netProfit,
      teacherPayments: teacherPaymentsSummary,
      studentPayments,
    };
  },

  /**
   * Marca pagamento de aluno como pago via API
   * Retorna erro 403 se houver mensalidades anteriores pendentes
   */
  async markStudentPaymentAsPaid(
    paymentId: string,
    month?: string,
    paymentMethod?: PaymentMethod,
  ): Promise<void> {
    try {
      await api.post('/payments/record', {
        paymentId,
        paymentDate: new Date().toISOString(),
        paymentMethod: paymentMethod || 'PIX',
      });
    } catch (error: any) {
      console.error('[dashboardFinanceService] Error marking payment as paid:', error);
      // Repassa a mensagem de erro do backend
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  /**
   * Adiantamento de pagamento para professor
   * Quando o aluno não paga, o admin pode pagar do bolso
   * Isso cria uma despesa do tipo ADIANTAMENTO_PROFESSOR
   */
  async advancePaymentForTeacher(
    paymentId: string,
    teacherName: string,
    studentName: string,
    paymentMethod?: PaymentMethod,
  ): Promise<{ paymentId: string; expenseId: string }> {
    try {
      const { data } = await api.post<{ paymentId: string; expenseId: string }>(
        '/payments/advance',
        {
          paymentId,
          paymentDate: new Date().toISOString(),
          paymentMethod: paymentMethod || 'PIX',
          teacherName,
          studentName,
        },
      );
      return data;
    } catch (error) {
      console.error('[dashboardFinanceService] Error advancing payment:', error);
      throw error;
    }
  },

  /**
   * Marca pagamento de aluno como pendente via API
   */
  async markStudentPaymentAsPending(paymentId: string, month?: string): Promise<void> {
    console.warn('[dashboardFinanceService] Revert payment not implemented in API');
    throw new Error('Revert payment not implemented in backend API');
  },

  /**
   * Marca pagamento de professor como pago via API
   */
  async markTeacherPaymentAsPaid(
    teacherPaymentId: string,
    month?: string,
    paymentMethod?: PaymentMethod,
  ): Promise<void> {
    try {
      await api.post('/teacher-payments/record', {
        teacherPaymentId,
        paymentDate: new Date().toISOString(),
        paymentMethod: paymentMethod || 'PIX',
      });
    } catch (error) {
      console.error('[dashboardFinanceService] Error marking teacher payment as paid:', error);
      throw error;
    }
  },

  /**
   * Marca pagamento de professor como pendente via API
   */
  async markTeacherPaymentAsPending(teacherPaymentId: string, month?: string): Promise<void> {
    console.warn('[dashboardFinanceService] Revert teacher payment not implemented in API');
    throw new Error('Revert teacher payment not implemented in backend API');
  },

  /**
   * Retorna a data de vencimento do mês atual (dia 10)
   */
  getCurrentMonthDueDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-10`;
  },

  /**
   * Retorna a data de vencimento de um mês específico (dia 10)
   */
  getMonthDueDate(month: string): string {
    return `${month}-10`;
  },

  /**
   * Retorna o mês atual no formato YYYY-MM
   */
  getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  },

  /**
   * Formata valor em reais
   */
  formatCurrency,
};
