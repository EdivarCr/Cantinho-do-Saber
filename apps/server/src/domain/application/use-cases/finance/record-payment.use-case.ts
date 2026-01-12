import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { NotAllowedError } from 'apps/server/src/core/errors/not-allowed.error';
import { inject, singleton } from 'tsyringe';
import {
  PAYMENT_REPOSITORY_TOKEN,
  IPaymentRepository,
} from '../../repositories/payment.repository';

type RecordPaymentRequest = {
  paymentId: string;
  paymentDate: Date;
  paymentMethod: string;
  skipPreviousCheck?: boolean; // Para casos de adiantamento do admin
};

type RecordPaymentResponse = Either<
  ResourceNotFoundError | NotAllowedError | Error,
  { paymentId: string }
>;

@singleton()
export class RecordPaymentUseCase {
  constructor(@inject(PAYMENT_REPOSITORY_TOKEN) private paymentRepo: IPaymentRepository) {}

  async execute(request: RecordPaymentRequest): Promise<RecordPaymentResponse> {
    try {
      console.log('[RecordPaymentUseCase] Recording payment:', request.paymentId);

      const payment = await this.paymentRepo.findById(request.paymentId);
      if (!payment) {
        console.error('[RecordPaymentUseCase] Payment not found');
        return fail(new ResourceNotFoundError('Payment'));
      }

      // Verifica se há mensalidades anteriores pendentes (a menos que seja adiantamento)
      if (!request.skipPreviousCheck) {
        const previousUnpaid = await this.paymentRepo.findPreviousUnpaidByEnrollment(
          payment.enrollmentId,
          payment.dueDate,
        );

        if (previousUnpaid.length > 0) {
          const pendingMonths = previousUnpaid.map((p) => {
            const date = p.dueDate;
            return `${date.getMonth() + 1}/${date.getFullYear()}`;
          });
          console.error(
            '[RecordPaymentUseCase] Previous payments pending:',
            pendingMonths.join(', '),
          );
          return fail(
            new NotAllowedError(
              `Não é possível receber esta mensalidade. Existem mensalidades anteriores pendentes: ${pendingMonths.join(', ')}`,
            ),
          );
        }
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
