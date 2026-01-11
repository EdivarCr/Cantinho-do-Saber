import { TeacherPayment, Teacher } from '@prisma/client';

export type TeacherPaymentSchema = TeacherPayment & {
  teacher?: Teacher;
};
