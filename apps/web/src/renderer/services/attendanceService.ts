// Serviço de Frequência integrado com API real
// Este serviço cria aulas (lessons) automaticamente e registra frequências no backend
import { api } from './api';
import { classService, type Class } from './classService';
import { teacherService } from './teacherService';
import { studentService } from './studentService';

export type AttendanceStatus = 'PRESENT' | 'PARTIAL' | 'ABSENT';

// Mapeamento frontend -> backend
const STATUS_TO_BACKEND: Record<AttendanceStatus, string> = {
  PRESENT: 'PRESENTE',
  PARTIAL: 'JUSTIFICADO',
  ABSENT: 'AUSENTE',
};

// Mapeamento backend -> frontend
const STATUS_FROM_BACKEND: Record<string, AttendanceStatus> = {
  PRESENTE: 'PRESENT',
  JUSTIFICADO: 'PARTIAL',
  AUSENTE: 'ABSENT',
};

export interface Student {
  id: string;
  name: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  attendancePercentage?: number;
}

export interface AttendanceRecord {
  id?: string;
  studentId: string;
  studentName?: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  observation?: string;
}

export interface DailyAttendance {
  classId: string;
  date: string;
  records: AttendanceRecord[];
}

interface LessonFromBackend {
  id: string;
  classId: string;
  date: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
}

interface AttendanceFromBackend {
  id: string;
  studentId: string;
  presenceStatus: string;
  lessonId: string;
  createdAt: string;
}

// ==================== HELPERS ====================

// Converte Class para ClassInfo
async function classToClassInfo(cls: Class): Promise<ClassInfo> {
  let teacherName = 'Sem professor';

  if (cls.teacherId) {
    try {
      const teachers = await teacherService.getAll();
      const teacher = teachers.find((t) => t.id === cls.teacherId);
      if (teacher) {
        teacherName = teacher.nome;
      }
    } catch {
      // Se falhar ao buscar professor, usa o padrão
    }
  }

  // Porcentagem de presença seria calculada pelo backend em uma implementação completa
  return {
    id: cls.id,
    name: cls.name,
    teacherId: cls.teacherId || '',
    teacherName,
    attendancePercentage: 0,
  };
}

// Formata data para DD/MM/YYYY
function formatDateForBackend(dateStr: string): string {
  // dateStr pode ser YYYY-MM-DD ou DD/MM/YYYY
  if (dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

// Formata data de ISO para YYYY-MM-DD
function formatDateFromBackend(isoDate: string): string {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Busca ou cria uma aula para a turma na data especificada
async function getOrCreateLesson(classId: string, dateStr: string): Promise<string> {
  // Busca aulas da turma
  try {
    const { data } = await api.get<{ lessons: LessonFromBackend[] }>(`/classes/${classId}/lessons`);

    // Normaliza a data para comparação
    const targetDate = dateStr.includes('-')
      ? dateStr
      : (() => {
          const [day, month, year] = dateStr.split('/');
          return `${year}-${month}-${day}`;
        })();

    // Procura aula na data especificada
    const existingLesson = data.lessons.find((lesson) => {
      const lessonDate = formatDateFromBackend(lesson.date);
      return lessonDate === targetDate;
    });

    if (existingLesson) {
      return existingLesson.id;
    }
  } catch (error) {
    console.log('[attendanceService] Nenhuma aula encontrada, criando nova...');
  }

  // Cria nova aula
  const formattedDate = formatDateForBackend(dateStr);
  const { data: createResponse } = await api.post(`/classes/${classId}/lessons`, {
    date: formattedDate,
    startTime: '08:00',
    durationStr: '01:00',
  });

  return createResponse.lessonId;
}

// ==================== SERVIÇO ====================

export const attendanceService = {
  // Listar todas as turmas (para admin)
  async listClasses(): Promise<ClassInfo[]> {
    const classes = await classService.getAll();
    const classInfos = await Promise.all(classes.map(classToClassInfo));
    return classInfos;
  },

  // Listar turmas do professor logado (busca pelo email do usuário)
  async listMyClasses(userEmail: string): Promise<ClassInfo[]> {
    const teachers = await teacherService.getAll();
    const teacher = teachers.find((t) => t.email === userEmail);

    if (!teacher) {
      console.warn('[attendanceService] Professor não encontrado para o email:', userEmail);
      return [];
    }

    const classes = await classService.getAll();
    const myClasses = classes.filter((c) => c.teacherId === teacher.id);
    const classInfos = await Promise.all(myClasses.map(classToClassInfo));
    return classInfos;
  },

  // Buscar detalhes de uma turma
  async getClassById(classId: string): Promise<ClassInfo | undefined> {
    const classes = await classService.getAll();
    const cls = classes.find((c) => c.id === classId);
    if (!cls) return undefined;
    return classToClassInfo(cls);
  },

  // Listar alunos de uma turma
  async listStudentsByClass(classId: string): Promise<Student[]> {
    const allStudents = await studentService.getAll();
    const classes = await classService.getAll();
    const cls = classes.find((c) => c.id === classId);
    const className = cls?.name || '';

    const classStudents = allStudents.filter((s) => s.class === classId || s.class === className);

    return classStudents.map((s) => ({
      id: s.id,
      name: s.name,
    }));
  },

  // Buscar frequência de uma turma em uma data específica
  async getAttendanceByDate(classId: string, date: string): Promise<AttendanceRecord[]> {
    try {
      // Busca aulas da turma
      const { data } = await api.get<{ lessons: LessonFromBackend[] }>(
        `/classes/${classId}/lessons`,
      );

      // Normaliza a data para comparação
      const targetDate = date.includes('-')
        ? date
        : (() => {
            const [day, month, year] = date.split('/');
            return `${year}-${month}-${day}`;
          })();

      // Procura aula na data especificada
      const lesson = data.lessons.find((l) => {
        const lessonDate = formatDateFromBackend(l.date);
        return lessonDate === targetDate;
      });

      if (!lesson) {
        return [];
      }

      // Busca frequências da aula
      const { data: attendanceData } = await api.get<{ attendances: AttendanceFromBackend[] }>(
        `/lessons/${lesson.id}/attendances`,
      );

      // Busca nomes dos alunos
      const students = await this.listStudentsByClass(classId);
      const studentMap = new Map(students.map((s) => [s.id, s.name]));

      return attendanceData.attendances.map((att) => ({
        id: att.id,
        studentId: att.studentId,
        studentName: studentMap.get(att.studentId) || 'Aluno desconhecido',
        classId,
        date: targetDate,
        status: STATUS_FROM_BACKEND[att.presenceStatus] || 'ABSENT',
      }));
    } catch (error) {
      console.error('[attendanceService] Erro ao buscar frequência:', error);
      return [];
    }
  },

  // Salvar chamada do dia
  async saveAttendance(attendance: DailyAttendance): Promise<void> {
    try {
      // Obtém ou cria a aula para a data
      const lessonId = await getOrCreateLesson(attendance.classId, attendance.date);

      // Registra cada frequência
      for (const record of attendance.records) {
        try {
          await api.post(`/lessons/${lessonId}/attendances`, {
            studentId: record.studentId,
            presenceStatus: STATUS_TO_BACKEND[record.status],
          });
        } catch (error: unknown) {
          // Se já existe, tenta atualizar
          const err = error as { response?: { status?: number } };
          if (err.response?.status === 409) {
            // Busca o ID da frequência existente
            const { data: attendanceData } = await api.get<{
              attendances: AttendanceFromBackend[];
            }>(`/lessons/${lessonId}/attendances`);
            const existing = attendanceData.attendances.find(
              (a) => a.studentId === record.studentId,
            );
            if (existing) {
              await api.put(`/attendances/${existing.id}`, {
                presenceStatus: STATUS_TO_BACKEND[record.status],
              });
            }
          } else {
            console.error('[attendanceService] Erro ao registrar frequência:', error);
          }
        }
      }

      console.log('[attendanceService] Frequência salva com sucesso');
    } catch (error) {
      console.error('[attendanceService] Erro ao salvar frequência:', error);
      throw error;
    }
  },

  // Atualizar registro de frequência individual
  async updateAttendance(
    recordId: string,
    status: AttendanceStatus,
    observation?: string,
  ): Promise<void> {
    try {
      await api.put(`/attendances/${recordId}`, {
        presenceStatus: STATUS_TO_BACKEND[status],
      });
      console.log('[attendanceService] Frequência atualizada:', recordId);
    } catch (error) {
      console.error('[attendanceService] Erro ao atualizar frequência:', error);
      throw error;
    }
  },
};
