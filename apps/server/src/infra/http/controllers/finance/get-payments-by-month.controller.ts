import { Router, Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { z } from 'zod';
import { checkJwt, requireAnyRole } from '../../../auth/auth.middleware';
import { GetPaymentsByMonthUseCase } from 'apps/server/src/domain/application/use-cases/finance/get-payments-by-month.use-case';

const monthParamSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
});

@injectable()
export class GetPaymentsByMonthController {
  public readonly router: Router;

  constructor(private readonly getPaymentsByMonthUseCase: GetPaymentsByMonthUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get(
      '/payments/month/:month',
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

    const result = await this.getPaymentsByMonthUseCase.execute({ month });

    if (result.isFail()) {
      return res.status(500).json({ message: result.value.message });
    }

    const { payments } = result.value;
    return res.status(200).json({
      payments: payments.map((p) => ({
        id: p.payment.id.toString(),
        studentId: p.studentId,
        studentName: p.studentName,
        className: p.className,
        amount: p.payment.amount,
        dueDate: p.payment.dueDate.toISOString(),
        paymentDate: p.payment.paymentDate?.toISOString() || null,
        status: p.payment.status,
        paymentMethod: p.payment.paymentMethod,
        enrollmentId: p.payment.enrollmentId,
      })),
    });
  }
}

