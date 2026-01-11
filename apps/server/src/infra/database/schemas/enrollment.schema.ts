import { Enrollment, Student, Contract, Payment } from '@prisma/client';

export type EnrollmentSchema = Enrollment & {
  student?: Student;
  contract?: Contract;
  payments?: Payment[];
};
