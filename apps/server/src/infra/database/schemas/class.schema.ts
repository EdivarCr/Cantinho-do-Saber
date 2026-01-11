import { Class, Lesson, Student, Teacher } from '@prisma/client';

export type ClassSchema = Class & {
  lessons?: Lesson[];
  students?: Student[];
  teacher?: Teacher;
};
