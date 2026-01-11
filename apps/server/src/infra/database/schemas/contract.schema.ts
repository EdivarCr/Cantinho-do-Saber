import { Contract, Enrollment } from '@prisma/client';

export type ContractSchema = Contract & {
  enrollments?: Enrollment[];
};
