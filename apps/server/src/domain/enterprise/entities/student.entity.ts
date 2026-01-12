import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { Optional } from 'apps/server/src/core/types/optional';
import { SchoolGrade } from 'apps/server/src/core/types/school-enums';
import { ClassEntity } from './class.entity';

export interface GuardianData {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  kinship: string;
}

export interface AddressData {
  id: string;
  street: string;
  number: string;
  district: string;
  complement?: string | null;
  city?: string | null;
  state?: string | null;
}

export interface StudentProps {
  name: string;
  birthDate: Date;
  classId: string;
  currentGrade: SchoolGrade; // Substitui seriesId
  addressIds: string[];
  guardianIds: string[];
  enrollmentIds: string[];
  attendanceIds: string[];

  // Full data for populated queries
  guardians?: GuardianData[];
  addresses?: AddressData[];

  // Optional class data for populated queries
  class?: ClassEntity | null;

  createdAt: Date;
  deletedAt: Date | null;
}

export class StudentEntity extends Entity<StudentProps> {
  get name() {
    return this.props.name;
  }

  get birthDate() {
    return this.props.birthDate;
  }

  get classId() {
    return this.props.classId;
  }

  get currentGrade() {
    return this.props.currentGrade;
  }

  get addressIds() {
    return this.props.addressIds;
  }

  get guardianIds() {
    return this.props.guardianIds;
  }

  get enrollmentIds() {
    return this.props.enrollmentIds;
  }

  get attendanceIds() {
    return this.props.attendanceIds;
  }

  get guardians() {
    return this.props.guardians ?? [];
  }

  get addresses() {
    return this.props.addresses ?? [];
  }

  get class() {
    return this.props.class;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get deletedAt() {
    return this.props.deletedAt;
  }

  static create(
    props: Optional<
      StudentProps,
      | 'createdAt'
      | 'deletedAt'
      | 'addressIds'
      | 'guardianIds'
      | 'enrollmentIds'
      | 'attendanceIds'
      | 'class'
      | 'guardians'
      | 'addresses'
    >,
    id?: UniqueEntityId,
  ): StudentEntity {
    return new StudentEntity(
      {
        ...props,
        addressIds: props.addressIds ?? [],
        guardianIds: props.guardianIds ?? [],
        enrollmentIds: props.enrollmentIds ?? [],
        attendanceIds: props.attendanceIds ?? [],
        guardians: props.guardians ?? [],
        addresses: props.addresses ?? [],
        class: props.class ?? null,
        createdAt: props.createdAt ?? new Date(),
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
