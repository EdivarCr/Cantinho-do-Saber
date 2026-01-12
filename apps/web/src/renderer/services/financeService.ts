// ============================================================================
// FINANCE SERVICE - Integrado com API Real
// ============================================================================

import { api } from './api';

// ============================================================================
// INTERFACES
// ============================================================================

export type ExpenseStatus = 'PAGO' | 'PENDENTE' | 'AGENDADO';
export type ExpenseCategory =
  | 'UTILIDADES'
  | 'SUPRIMENTOS'
  | 'MANUTENÇÃO'
  | 'MARKETING'
  | 'OUTROS'
  | 'ADIANTAMENTO_PROFESSOR';

export type PaymentMethod = 'PIX' | 'DINHEIRO' | 'MISTO';

export interface Expense {
  id: string;
  description: string;
  category: ExpenseCategory;
  dueDate: string; // ISO date string
  amount: number;
  status: ExpenseStatus;
  paidAt?: string;
  paymentId?: string; // Link to payment when expense is for overdue payments
  createdAt: string;
}

export interface StudentPayment {
  id: string;
  studentId: string;
  studentName: string;
  enrollmentId: string;
  amount: number;
  dueDate: string;
  paidAt?: string;
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO';
  paymentMethod?: PaymentMethod;
}

export interface TeacherPayroll {
  id: string;
  teacherId: string;
  teacherName: string;
  shift: string;
  activeStudents: number;
  totalContracts: number;
  participationRate: number;
  amountToPay: number;
  realizedRevenue: number;
  status: 'PENDENTE' | 'CONCLUIDO';
  paidAt?: string;
  paymentMethod?: PaymentMethod;
  month: string;
}

export interface FinanceSummary {
  realizedRevenue: number;
  expenses: number;
  netProfit: number;
  defaultAmount: number;
  month: string;
}

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
// EXPENSE SERVICE
// ============================================================================

export const expenseService = {
  async getAll(): Promise<Expense[]> {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return this.getByMonth(currentMonth);
  },

  async getByMonth(month: string): Promise<Expense[]> {
    console.log('[expenseService] Fetching expenses for month:', month);
    try {
      const { data } = await api.get(`/expenses/month/${month}`);
      console.log('[expenseService] Received expenses:', data);
      return data.expenses || [];
    } catch (error) {
      console.error('[expenseService] Error fetching expenses:', error);
      throw error;
    }
  },

  async create(data: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    console.log('[expenseService] Creating expense:', data);
    try {
      const { data: response } = await api.post('/expenses', {
        description: data.description,
        category: data.category,
        amount: data.amount,
        dueDate: data.dueDate,
        paidAt: data.paidAt,
        status: data.status,
        paymentId: data.paymentId,
      });
      console.log('[expenseService] Expense created:', response);

      return {
        id: response.expenseId,
        description: data.description,
        category: data.category,
        amount: data.amount,
        dueDate: data.dueDate,
        paidAt: data.paidAt,
        status: data.status,
        paymentId: data.paymentId,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[expenseService] Error creating expense:', error);
      throw error;
    }
  },

  async update(id: string, data: Partial<Expense>): Promise<Expense> {
    console.warn('[expenseService] Expense update not yet implemented in backend');
    throw new Error('Expense update not yet implemented in backend API');
  },

  async delete(id: string): Promise<void> {
    console.warn('[expenseService] Expense deletion not yet implemented in backend');
    throw new Error('Expense deletion not yet implemented in backend API');
  },

  async markAsPaid(id: string): Promise<Expense> {
    try {
      const { data } = await api.patch<{ expenseId: string }>(`/expenses/${id}/pay`, {
        paidAt: new Date().toISOString(),
      });
      // Return updated expense - fetch from API or construct locally
      const expenses = await this.getByMonth(
        `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
      );
      const updated = expenses.find((e) => e.id === id);
      if (updated) return updated;
      throw new Error('Expense not found after update');
    } catch (error) {
      console.error('[expenseService] Error marking expense as paid:', error);
      throw error;
    }
  },

  async revertToPending(id: string): Promise<Expense> {
    try {
      await api.patch(`/expenses/${id}/revert`);
      // Return updated expense - fetch from API or construct locally
      const expenses = await this.getByMonth(
        `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
      );
      const updated = expenses.find((e) => e.id === id);
      if (updated) return updated;
      throw new Error('Expense not found after update');
    } catch (error) {
      console.error('[expenseService] Error reverting expense to pending:', error);
      throw error;
    }
  },

  async getCategories(): Promise<string[]> {
    return Promise.resolve([
      'UTILIDADES',
      'SUPRIMENTOS',
      'MANUTENÇÃO',
      'MARKETING',
      'OUTROS',
      'ADIANTAMENTO_PROFESSOR',
    ]);
  },

  async addCategory(category: string): Promise<string[]> {
    return this.getCategories();
  },
};

// ============================================================================
// STUDENT PAYMENT SERVICE - Integrado com API
// ============================================================================

export const studentPaymentService = {
  async getAll(): Promise<StudentPayment[]> {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return this.getByMonth(currentMonth);
  },

  async getByMonth(month: string): Promise<StudentPayment[]> {
    console.log('[studentPaymentService] Fetching payments for month:', month);
    try {
      const { data } = await api.get<{ payments: PaymentFromBackend[] }>(
        `/payments/month/${month}`,
      );
      console.log('[studentPaymentService] Received payments:', data);

      return data.payments.map((p) => ({
        id: p.id,
        studentId: p.studentId,
        studentName: p.studentName,
        enrollmentId: p.enrollmentId,
        amount: p.amount,
        dueDate: p.dueDate,
        paidAt: p.paymentDate || undefined,
        status: p.status as 'PENDENTE' | 'PAGO' | 'ATRASADO',
        paymentMethod: (p.paymentMethod as PaymentMethod) || undefined,
      }));
    } catch (error) {
      console.error('[studentPaymentService] Error fetching payments:', error);
      return [];
    }
  },

  async getPending(): Promise<StudentPayment[]> {
    const payments = await this.getAll();
    return payments.filter((p) => p.status === 'PENDENTE' || p.status === 'ATRASADO');
  },

  async receivePayment(id: string, paymentMethod: PaymentMethod): Promise<StudentPayment> {
    console.log('[studentPaymentService] Recording payment:', id, paymentMethod);
    try {
      await api.post('/payments/record', {
        paymentId: id,
        paymentDate: new Date().toISOString(),
        paymentMethod,
      });

      // Return updated payment
      const payments = await this.getAll();
      const payment = payments.find((p) => p.id === id);
      if (!payment) throw new Error('Pagamento não encontrado');
      return payment;
    } catch (error) {
      console.error('[studentPaymentService] Error recording payment:', error);
      throw error;
    }
  },

  async revertToPending(id: string): Promise<StudentPayment> {
    console.warn('[studentPaymentService] Revert payment not yet implemented in backend');
    throw new Error('Revert payment not yet implemented in backend API');
  },

  async create(data: Omit<StudentPayment, 'id'>): Promise<StudentPayment> {
    console.warn('[studentPaymentService] Create payment directly not implemented');
    throw new Error('Use enrollment creation to generate payments');
  },
};

// ============================================================================
// TEACHER PAYROLL SERVICE - Integrado com API
// ============================================================================

export const teacherPayrollService = {
  async getAll(): Promise<TeacherPayroll[]> {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return this.getByMonth(currentMonth);
  },

  async getByMonth(month: string): Promise<TeacherPayroll[]> {
    console.log('[teacherPayrollService] Fetching teacher payments for month:', month);
    try {
      const { data } = await api.get<{ teacherPayments: TeacherPaymentFromBackend[] }>(
        `/teacher-payments/month/${month}`,
      );
      console.log('[teacherPayrollService] Received teacher payments:', data);

      return data.teacherPayments.map((tp) => ({
        id: tp.id,
        teacherId: tp.teacherId,
        teacherName: tp.teacherName,
        shift: '', // Shift não é retornado pelo backend
        activeStudents: tp.activeStudents,
        totalContracts: tp.totalContracts,
        participationRate: tp.participationRate,
        amountToPay: tp.amountToPay,
        realizedRevenue: tp.realizedRevenue,
        status: tp.status === 'PAGO' ? 'CONCLUIDO' : 'PENDENTE',
        paidAt: tp.paidAt || undefined,
        paymentMethod: (tp.paymentMethod as PaymentMethod) || undefined,
        month: tp.month,
      }));
    } catch (error) {
      console.error('[teacherPayrollService] Error fetching teacher payments:', error);
      return [];
    }
  },

  async getPending(): Promise<TeacherPayroll[]> {
    const payrolls = await this.getAll();
    return payrolls.filter((p) => p.status === 'PENDENTE');
  },

  async closePayroll(id: string, paymentMethod: PaymentMethod): Promise<TeacherPayroll> {
    console.log('[teacherPayrollService] Recording teacher payment:', id, paymentMethod);
    try {
      await api.post('/teacher-payments/record', {
        teacherPaymentId: id,
        paymentDate: new Date().toISOString(),
        paymentMethod,
      });

      // Return updated payroll
      const payrolls = await this.getAll();
      const payroll = payrolls.find((p) => p.id === id);
      if (!payroll) throw new Error('Folha não encontrada');
      return payroll;
    } catch (error) {
      console.error('[teacherPayrollService] Error recording teacher payment:', error);
      throw error;
    }
  },

  async revertToPending(id: string): Promise<TeacherPayroll> {
    console.warn('[teacherPayrollService] Revert payment not yet implemented in backend');
    throw new Error('Revert payment not yet implemented in backend API');
  },

  async create(data: Omit<TeacherPayroll, 'id'>): Promise<TeacherPayroll> {
    console.warn('[teacherPayrollService] Create payroll directly not implemented');
    throw new Error('Teacher payments are calculated automatically');
  },
};

// ============================================================================
// FINANCE SUMMARY SERVICE
// ============================================================================

const loadDashboardFinanceService = async () => {
  const { dashboardFinanceService } = await import('./dashboardFinanceService');
  return dashboardFinanceService;
};

export const financeSummaryService = {
  async getSummary(month: string): Promise<FinanceSummary> {
    const dashboardService = await loadDashboardFinanceService();
    const realFinanceData = await dashboardService.getFinanceSummary(month);

    const expenses = await expenseService.getByMonth(month);
    const paidExpenses = expenses.filter((e) => e.status === 'PAGO');
    const operationalExpenses = paidExpenses.reduce((sum, e) => sum + e.amount, 0);

    const realizedRevenue = realFinanceData.paidMonthlyFees;
    const teacherPayments = realFinanceData.paidTeacherPayments;
    const totalExpenses = teacherPayments + operationalExpenses;
    const netProfit = realizedRevenue - totalExpenses;
    const defaultAmount = realFinanceData.pendingMonthlyFees + realFinanceData.overdueMonthlyFees;

    return {
      realizedRevenue,
      expenses: totalExpenses,
      netProfit,
      defaultAmount,
      month,
    };
  },
};
