import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { inject, singleton } from 'tsyringe';
import { ContractEntity } from '../../../enterprise/entities/contract.entity';
import { EnrollmentEntity } from '../../../enterprise/entities/enrollment.entity';
import { PaymentEntity } from '../../../enterprise/entities/payment.entity';
import {
  CONTRACT_REPOSITORY_TOKEN,
  IContractRepository,
} from '../../repositories/contract.repository';
import {
  ENROLLMENT_REPOSITORY_TOKEN,
  IEnrollmentRepository,
} from '../../repositories/enrollment.repository';
import {
  PAYMENT_REPOSITORY_TOKEN,
  IPaymentRepository,
} from '../../repositories/payment.repository';

type CreateEnrollmentRequest = {
  studentId: string;
  monthlyAmount: number;
  signatureDate: Date;
  dueDate?: Date;
};

type CreateEnrollmentResponse = Either<CannotCreateError, { enrollmentId: string }>;

@singleton()
export class CreateEnrollmentUseCase {
  constructor(
    @inject(ENROLLMENT_REPOSITORY_TOKEN) private enrollmentRepo: IEnrollmentRepository,
    @inject(CONTRACT_REPOSITORY_TOKEN) private contractRepo: IContractRepository,
    @inject(PAYMENT_REPOSITORY_TOKEN) private paymentRepo: IPaymentRepository,
  ) {}

  async execute(request: CreateEnrollmentRequest): Promise<CreateEnrollmentResponse> {
    try {
      console.log('[CreateEnrollmentUseCase] Starting enrollment creation for student:', request.studentId);

      // 1. Criar contrato
      const contract = ContractEntity.create({
        signatureDate: request.signatureDate,
        dueDate: request.dueDate,
        monthlyAmount: request.monthlyAmount,
      });
      
      const contractCreated = await this.contractRepo.create(contract);
      if (!contractCreated) {
        console.error('[CreateEnrollmentUseCase] Failed to create contract');
        return fail(new CannotCreateError('Contract'));
      }
      console.log('[CreateEnrollmentUseCase] Contract created:', contract.id.toString());

      // 2. Criar matrícula
      const enrollment = EnrollmentEntity.create({
        studentId: request.studentId,
        contractId: contract.id.toString(),
        status: 'ATIVA',
        enrollmentDate: new Date(),
      });
      
      const enrollmentCreated = await this.enrollmentRepo.create(enrollment);
      if (!enrollmentCreated) {
        console.error('[CreateEnrollmentUseCase] Failed to create enrollment');
        return fail(new CannotCreateError('Enrollment'));
      }
      console.log('[CreateEnrollmentUseCase] Enrollment created:', enrollment.id.toString());

      // 3. Gerar 12 mensalidades (janeiro a dezembro do ano corrente)
      const currentYear = new Date().getFullYear();
      for (let month = 1; month <= 12; month++) {
        const payment = PaymentEntity.create({
          enrollmentId: enrollment.id.toString(),
          amount: request.monthlyAmount,
          dueDate: new Date(currentYear, month - 1, 10), // Dia 10 de cada mês
          status: 'PENDENTE',
        });
        
        const paymentCreated = await this.paymentRepo.create(payment);
        if (!paymentCreated) {
          console.warn(`[CreateEnrollmentUseCase] Failed to create payment for month ${month}`);
        }
      }
      console.log('[CreateEnrollmentUseCase] 12 monthly payments created');

      return succeed({ enrollmentId: enrollment.id.toString() });
    } catch (error) {
      console.error('[CreateEnrollmentUseCase] Error:', error);
      return fail(new Error('Cannot create enrollment: ' + (error as Error).message));
    }
  }
}
