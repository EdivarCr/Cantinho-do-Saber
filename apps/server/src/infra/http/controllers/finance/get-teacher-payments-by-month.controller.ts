import { Router, Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { z } from 'zod';
import { checkJwt, requireAnyRole } from '../../../auth/auth.middleware';
import { GetTeacherPaymentsByMonthUseCase } from 'apps/server/src/domain/application/use-cases/finance/get-teacher-payments-by-month.use-case';

const monthParamSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
});

@injectable()
export class GetTeacherPaymentsByMonthController {
  public readonly router: Router;

  constructor(private readonly getTeacherPaymentsByMonthUseCase: GetTeacherPaymentsByMonthUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get(
      '/teacher-payments/month/:month',
      checkJwt,
      requireAnyRole(['ADMIN', 'COMUM']),
      this.handle.bind(this),
    );
  }

  async handle(req: Request, res: Response) {
    const paramsValidation = monthParamSchema.safeParse(req.params);

    if (!paramsValidation.success) {
      return res.status(400).json({ message: 'Invalid month format. Use YYYY-MM' });
    }

    const { month } = paramsValidation.data;

    const result = await this.getTeacherPaymentsByMonthUseCase.execute({ month });

    if (result.isFail()) {
      return res.status(500).json({ message: result.value.message });
    }

    const { teacherPayments } = result.value;
    return res.status(200).json({
      teacherPayments: teacherPayments.map((tp) => ({
        id: tp.payment.id.toString(),
        teacherId: tp.payment.teacherId,
        teacherName: tp.teacherName,
        month: tp.payment.month,
        activeStudents: tp.payment.activeStudents,
        totalContracts: tp.payment.totalContracts,
        participationRate: tp.payment.participationRate,
        realizedRevenue: tp.payment.realizedRevenue,
        amountToPay: tp.payment.amountToPay,
        status: tp.payment.status,
        paidAt: tp.payment.paidAt?.toISOString() || null,
        paymentMethod: tp.payment.paymentMethod,
      })),
    });
  }
}

