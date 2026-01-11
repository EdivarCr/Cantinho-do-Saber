import { Payment, Enrollment } from '@prisma/client';

export type PaymentSchema = Payment & {
  enrollment?: Enrollment;
};
