import { Student, Address, StudentHasGuardian, Enrollment, Attendance, Class, Teacher, Guardian } from '@prisma/client';

export type StudentSchema = Student & {
  addresses?: Address[];
  guardians?: (StudentHasGuardian & { guardian?: Guardian })[];
  enrollments?: Enrollment[];
  attendances?: Attendance[];
  class?: Class & { teacher?: Teacher };
};
