import { TeacherPaymentEntity } from '../../enterprise/entities/teacher-payment.entity';

export interface ITeacherPaymentRepository {
  create(teacherPayment: TeacherPaymentEntity): Promise<boolean>;
  findById(id: string): Promise<TeacherPaymentEntity | null>;
  findByTeacherId(teacherId: string): Promise<TeacherPaymentEntity[]>;
  findByMonth(month: string): Promise<TeacherPaymentEntity[]>;
  findByTeacherIdAndMonth(teacherId: string, month: string): Promise<TeacherPaymentEntity | null>;
  upsert(teacherPayment: TeacherPaymentEntity): Promise<boolean>;
  update(teacherPayment: TeacherPaymentEntity): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}

export const TEACHER_PAYMENT_REPOSITORY_TOKEN = Symbol('TeacherPaymentRepository');
