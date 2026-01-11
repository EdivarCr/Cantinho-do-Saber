import { StudentEntity } from 'apps/server/src/domain/enterprise/entities/student.entity';

export class StudentPresenter {
  static toHTTP(student: StudentEntity) {
    return {
      id: student.id.toString(),
      name: student.name,
      birthDate: student.birthDate,
      classId: student.classId,
      currentGrade: student.currentGrade,
      class: student.class ? {
        id: student.class.id.toString(),
        name: student.class.name,
        shift: student.class.shift,
        teacher: student.class.teacher ? {
          id: student.class.teacher.id.toString(),
          name: student.class.teacher.name,
          email: student.class.teacher.email,
          phone: student.class.teacher.phone,
          qualifiedGrades: student.class.teacher.qualifiedGrades,
        } : null,
      } : null,
      addressIds: student.addressIds,
      guardianIds: student.guardianIds,
      enrollmentIds: student.enrollmentIds,
      attendanceIds: student.attendanceIds,
      createdAt: student.createdAt,
    };
  }
}
