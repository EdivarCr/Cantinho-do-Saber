import { inject, injectable } from 'tsyringe';
import { Either, fail, succeed } from 'apps/server/src/core/either';
import {
  ITeacherPaymentRepository,
  TEACHER_PAYMENT_REPOSITORY_TOKEN,
} from '../../repositories/teacher-payment.repository';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';

interface RecordTeacherPaymentRequest {
  teacherPaymentId: string;
  paymentDate: Date;
  paymentMethod: string;
}

type RecordTeacherPaymentResponse = Either<ResourceNotFoundError, { teacherPaymentId: string }>;

@injectable()
export class RecordTeacherPaymentUseCase {
  constructor(
    @inject(TEACHER_PAYMENT_REPOSITORY_TOKEN)
    private readonly teacherPaymentRepository: ITeacherPaymentRepository,
  ) {}

  async execute(request: RecordTeacherPaymentRequest): Promise<RecordTeacherPaymentResponse> {
    const { teacherPaymentId, paymentDate, paymentMethod } = request;

    const teacherPayment = await this.teacherPaymentRepository.findById(teacherPaymentId);
    if (!teacherPayment) {
      return fail(new ResourceNotFoundError('Pagamento de professor não encontrado'));
    }

    teacherPayment.status = 'PAGO';
    teacherPayment.paidAt = paymentDate;
    teacherPayment.paymentMethod = paymentMethod;

    const updated = await this.teacherPaymentRepository.update(teacherPayment);
    if (!updated) {
      return fail(new ResourceNotFoundError('Falha ao atualizar pagamento'));
    }

    return succeed({ teacherPaymentId: teacherPayment.id.toString() });
  }
}

