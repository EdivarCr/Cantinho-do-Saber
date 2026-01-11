import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { Optional } from 'apps/server/src/core/types/optional';
import { Shift } from 'apps/server/src/core/types/school-enums';

export interface ClassEntityProps {
  name: string;
  teacherId: string;
  shift: Shift;
  // Removido: grades - agora vem do professor

  studentIds: string[] | null;
  lessonIds: string[] | null;

  createdAt: Date;
  deletedAt: Date | null;
}

export class ClassEntity extends Entity<ClassEntityProps> {
  get name() {
    return this.props.name;
  }

  get teacherId() {
    return this.props.teacherId;
  }

  get shift() {
    return this.props.shift;
  }

  get studentIds() {
    return this.props.studentIds;
  }

  get lessonIds() {
    return this.props.lessonIds;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get deletedAt() {
    return this.props.deletedAt;
  }

  static create(props: Optional<ClassEntityProps, 'createdAt' | 'deletedAt'>, id?: UniqueEntityId) {
    const classEntity = new ClassEntity(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );

    return classEntity;
  }
}
