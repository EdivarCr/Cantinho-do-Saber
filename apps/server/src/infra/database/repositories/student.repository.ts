import { IStudentRepository } from 'apps/server/src/domain/application/repositories/student.repository';
import { StudentEntity } from 'apps/server/src/domain/enterprise/entities/student.entity';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';
import { StudentMapper } from '../mapper/student.mapper';
import { StudentSchema } from '../schemas/student.schema';
import { SchoolGrade } from 'apps/server/src/core/types/school-enums';

@singleton()
export class StudentRepository implements IStudentRepository {
  async getStudentsCount(): Promise<number> {
    const count = await prisma.student.count({
      where: { deletedAt: null }, // Contar apenas ativos
    });
    return count;
  }

  async findByName(name: string): Promise<StudentEntity[]> {
    console.log(`[StudentRepository] Searching students with name: "${name}"`);
    
    const students = await prisma.student.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
        deletedAt: null,
      },
      // Include necessário para popular os IDs no Mapper
      include: {
        addresses: true,
        guardians: {
          include: {
            guardian: true,
          },
        },
        class: {
          include: {
            teacher: true, // IMPORTANT: include teacher
          },
        },
        enrollments: true,
        attendances: true,
      },
    });

    console.log(`[StudentRepository] Found ${students.length} students`);
    return students.map((s) => StudentMapper.toDomain(s as StudentSchema));
  }

  async create(studentEntity: StudentEntity): Promise<boolean> {
    try {
      const raw = StudentMapper.toDatabase(studentEntity);

      await prisma.student.create({
        data: {
          id: raw.id,
          name: raw.name,
          birthDate: raw.birthDate,
          currentGrade: raw.currentGrade,
          createdAt: raw.createdAt,
          deletedAt: raw.deletedAt,

          class: { connect: { id: raw.classId } },

          // Endereços podem ser conectados se já existirem
          addresses:
            raw.addressIds.length > 0
              ? { connect: raw.addressIds.map((id) => ({ id })) }
              : undefined,

          // ! NOTA: Guardians NÃO são conectados aqui.
          // O vínculo exige 'kinship' e deve ser feito via LinkGuardianToStudentUseCase.
        },
      });

      return true;
    } catch (error) {
      console.error('[StudentRepository] Error creating student:', error);
      return false;
    }
  }

  async findById(id: string): Promise<StudentEntity | null> {
    console.log(`[StudentRepository] Finding student by id: ${id}`);
    
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        addresses: true,
        guardians: {
          include: {
            guardian: true,
          },
        },
        enrollments: true,
        attendances: true,
        class: {
          include: {
            teacher: true,
          },
        },
      },
    });

    if (!student) {
      console.log(`[StudentRepository] Student not found: ${id}`);
      return null;
    }
    
    console.log(`[StudentRepository] Found student: ${student.name}`);
    return StudentMapper.toDomain(student as StudentSchema);
  }

  async update(studentEntity: StudentEntity): Promise<boolean> {
    try {
      const raw = StudentMapper.toDatabase(studentEntity);

      await prisma.student.update({
        where: { id: raw.id },
        data: {
          name: raw.name,
          birthDate: raw.birthDate,
          currentGrade: raw.currentGrade,
          deletedAt: raw.deletedAt,

          class: { connect: { id: raw.classId } },

          addresses: {
            set: raw.addressIds.map((id) => ({ id })),
          },
          // Guardiões não são atualizados via Student update,
          // já que arelação é gerenciada na tabela StudentHasGuardian.
        },
      });

      return true;
    } catch (error) {
      console.error('[StudentRepository] Error updating student:', error);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.student.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch (error) {
      console.error('[StudentRepository] Error deleting student:', error);
      return false;
    }
  }

  async findAllByClass(classId: string): Promise<StudentEntity[]> {
    console.log(`[StudentRepository] Finding students by class: ${classId}`);
    
    const students = await prisma.student.findMany({
      where: { classId, deletedAt: null },
      include: { 
        addresses: true, 
        guardians: {
          include: {
            guardian: true,
          },
        },
        class: {
          include: {
            teacher: true,
          },
        },
        enrollments: true,
        attendances: true,
      },
    });
    
    console.log(`[StudentRepository] Found ${students.length} students in class`);
    return students.map((s) => StudentMapper.toDomain(s as StudentSchema));
  }

  async findAllByGrade(grade: SchoolGrade): Promise<StudentEntity[]> {
    console.log(`[StudentRepository] Finding students by grade: ${grade}`);
    
    const students = await prisma.student.findMany({
      where: { currentGrade: grade, deletedAt: null },
      include: { 
        addresses: true, 
        guardians: {
          include: {
            guardian: true,
          },
        },
        class: {
          include: {
            teacher: true,
          },
        },
        enrollments: true,
        attendances: true,
      },
    });
    
    console.log(`[StudentRepository] Found ${students.length} students in grade`);
    return students.map((s) => StudentMapper.toDomain(s as StudentSchema));
  }
}
