import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { EnrollmentEntity } from 'apps/server/src/domain/enterprise/entities/enrollment.entity';
import { EnrollmentSchema } from '../schemas/enrollment.schema';

export interface EnrollmentPersistenceDTO {
  id: string;
  status: string;
  enrollmentDate: Date;
  studentId: string;
  contractId: string;
  createdAt: Date;
  deletedAt: Date | null;
}

export class EnrollmentMapper {
  static toDomain(raw: EnrollmentSchema): EnrollmentEntity {
    return EnrollmentEntity.create(
      {
        status: raw.status,
        enrollmentDate: raw.enrollmentDate,
        studentId: raw.studentId,
        contractId: raw.contractId,
        createdAt: raw.createdAt,
        deletedAt: raw.deletedAt,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: EnrollmentEntity): EnrollmentPersistenceDTO {
    return {
      id: entity.id.toString(),
      status: entity.status,
      enrollmentDate: entity.enrollmentDate,
      studentId: entity.studentId,
      contractId: entity.contractId,
      createdAt: entity.createdAt,
      deletedAt: entity.deletedAt,
    };
  }
}
