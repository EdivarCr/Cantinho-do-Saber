import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { inject, singleton } from 'tsyringe';
import {
  PAYMENT_REPOSITORY_TOKEN,
  IPaymentRepository,
} from '../../repositories/payment.repository';

type RecordPaymentRequest = {
  paymentId: string;
  paymentDate: Date;
  paymentMethod: string;
};

type RecordPaymentResponse = Either<ResourceNotFoundError, { paymentId: string }>;

@singleton()
export class RecordPaymentUseCase {
  constructor(
    @inject(PAYMENT_REPOSITORY_TOKEN) private paymentRepo: IPaymentRepository,
  ) {}

  async execute(request: RecordPaymentRequest): Promise<RecordPaymentResponse> {
    try {
      console.log('[RecordPaymentUseCase] Recording payment:', request.paymentId);

      const payment = await this.paymentRepo.findById(request.paymentId);
      if (!payment) {
        console.error('[RecordPaymentUseCase] Payment not found');
        return fail(new ResourceNotFoundError('Payment'));
      }

      payment.paymentDate = request.paymentDate;
      payment.paymentMethod = request.paymentMethod;
      payment.status = 'PAGO';

      const updated = await this.paymentRepo.update(payment);
      if (!updated) {
        console.error('[RecordPaymentUseCase] Failed to update payment');
        return fail(new Error('Failed to update payment'));
      }

      console.log('[RecordPaymentUseCase] Payment recorded successfully');
      return succeed({ paymentId: payment.id.toString() });
    } catch (error) {
      console.error('[RecordPaymentUseCase] Error:', error);
      return fail(new Error('Cannot record payment: ' + (error as Error).message));
    }
  }
}
