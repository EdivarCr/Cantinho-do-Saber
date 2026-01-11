import { ClassEntity } from 'apps/server/src/domain/enterprise/entities/class.entity';

export class ClassPresenter {
  static toHTTP(classEntity: ClassEntity) {
    return {
      id: classEntity.id.toString(),
      name: classEntity.name,
      teacherId: classEntity.teacherId,
      shift: classEntity.shift,
      // Removido: grades - deve vir do professor quando necessário
      teacher: classEntity.teacher ? {
        id: classEntity.teacher.id.toString(),
        name: classEntity.teacher.name,
        qualifiedGrades: classEntity.teacher.qualifiedGrades,
        email: classEntity.teacher.email,
        phone: classEntity.teacher.phone,
      } : null,
      studentIds: classEntity.studentIds,
      lessonIds: classEntity.lessonIds,
      createdAt: classEntity.createdAt,
    };
  }
}
