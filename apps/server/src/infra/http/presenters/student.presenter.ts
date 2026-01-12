import { StudentEntity } from 'apps/server/src/domain/enterprise/entities/student.entity';

export class StudentPresenter {
  static toHTTP(student: StudentEntity) {
    return {
      id: student.id.toString(),
      name: student.name,
      birthDate: student.birthDate,
      classId: student.classId,
      currentGrade: student.currentGrade,
      class: student.class
        ? {
            id: student.class.id.toString(),
            name: student.class.name,
            shift: student.class.shift,
            teacher: student.class.teacher
              ? {
                  id: student.class.teacher.id.toString(),
                  name: student.class.teacher.name,
                  email: student.class.teacher.email,
                  phone: student.class.teacher.phone,
                  qualifiedGrades: student.class.teacher.qualifiedGrades,
                }
              : null,
          }
        : null,
      // Full guardian data
      guardians: student.guardians.map((g) => ({
        id: g.id,
        name: g.name,
        phone: g.phone,
        email: g.email,
        kinship: g.kinship,
      })),
      // Full address data
      addresses: student.addresses.map((a) => ({
        id: a.id,
        street: a.street,
        number: a.number,
        district: a.district,
        complement: a.complement,
        city: a.city,
        state: a.state,
      })),
      // Keep IDs for backwards compatibility
      addressIds: student.addressIds,
      guardianIds: student.guardianIds,
      enrollmentIds: student.enrollmentIds,
      attendanceIds: student.attendanceIds,
      createdAt: student.createdAt,
    };
  }
}
