import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { Optional } from 'apps/server/src/core/types/optional';

export interface EnrollmentProps {
  status: string; // ATIVA, TRANCADA, CANCELADA
  enrollmentDate: Date;
  studentId: string;
  contractId: string;

  createdAt: Date;
  deletedAt: Date | null;
}

export class EnrollmentEntity extends Entity<EnrollmentProps> {
  get status() {
    return this.props.status;
  }

  get enrollmentDate() {
    return this.props.enrollmentDate;
  }

  get studentId() {
    return this.props.studentId;
  }

  get contractId() {
    return this.props.contractId;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get deletedAt() {
    return this.props.deletedAt;
  }

  static create(
    props: Optional<EnrollmentProps, 'createdAt' | 'deletedAt'>,
    id?: UniqueEntityId,
  ): EnrollmentEntity {
    const enrollment = new EnrollmentEntity(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
    return enrollment;
  }
}
