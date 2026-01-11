import { EnrollmentEntity } from '../../enterprise/entities/enrollment.entity';

export interface IEnrollmentRepository {
  create(enrollment: EnrollmentEntity): Promise<boolean>;
  findById(id: string): Promise<EnrollmentEntity | null>;
  findByStudentId(studentId: string): Promise<EnrollmentEntity | null>;
  update(enrollment: EnrollmentEntity): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}

export const ENROLLMENT_REPOSITORY_TOKEN = Symbol('EnrollmentRepository');
