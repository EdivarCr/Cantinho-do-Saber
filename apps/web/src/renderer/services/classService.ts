/**
 * Class Service - Real API Integration
 * Uses backend API endpoints for class management
 */

import { api } from './api';
import { teacherService, type Teacher } from './teacherService';

export type ClassShift = 'MATUTINO' | 'VESPERTINO';

export interface TimeSlot {
  start: string;
  end: string;
}

// Representa um aluno ocupando um horario na turma
export interface StudentSlot {
  studentId: string;
  studentName: string;
  start: string;
  end: string;
}

export interface Class {
  id: string;
  name: string;
  shift: ClassShift;
  teacherId: string | null;
  studentCount: number;
  capacity: number;
  schedule: TimeSlot;
  competencias: string[];
  studentSlots: StudentSlot[];
}

// Interface que vem do backend
interface ClassFromBackend {
  id: string;
  name: string;
  shift: string;
  teacherId: string | null;
  teacher?: {
    id: string;
    name: string;
    qualifiedGrades: string[];
    email: string;
    phone: string;
  } | null;
  studentIds: string[];
  studentsCount: number;
  lessonIds: string[];
  createdAt: string;
}

const MAX_STUDENTS_PER_SLOT = 4;

// Horarios padrao por turno
const SHIFT_SCHEDULES: Record<ClassShift, TimeSlot> = {
  MATUTINO: { start: '08:00', end: '12:00' },
  VESPERTINO: { start: '13:00', end: '17:30' },
};

// Mapeamento de grades do backend para frontend
const BACKEND_TO_GRADE: Record<string, string> = {
  PRIMEIRO_ANO: '1º Ano',
  SEGUNDO_ANO: '2º Ano',
  TERCEIRO_ANO: '3º Ano',
  QUARTO_ANO: '4º Ano',
  QUINTO_ANO: '5º Ano',
  SEXTO_ANO: '6º Ano',
  SETIMO_ANO: '7º Ano',
  OITAVO_ANO: '8º Ano',
  NONO_ANO: '9º Ano',
};

// Mapeamento de turno para frontend (legacy compatibility)
const SHIFT_MAP: Record<string, ClassShift> = {
  MATUTINO: 'MATUTINO',
  VESPERTINO: 'VESPERTINO',
  MANHA: 'MATUTINO',
  TARDE: 'VESPERTINO',
};

function getScheduleForShift(shift: ClassShift): TimeSlot {
  return SHIFT_SCHEDULES[shift] || SHIFT_SCHEDULES.MATUTINO;
}

// Converte do formato backend para frontend
function fromBackend(c: ClassFromBackend): Class {
  const shift = SHIFT_MAP[c.shift] || 'MATUTINO';
  const competencias = c.teacher?.qualifiedGrades?.map((g) => BACKEND_TO_GRADE[g] || g) || [];

  return {
    id: c.id,
    name: c.name,
    shift,
    teacherId: c.teacherId,
    studentCount: c.studentsCount || c.studentIds?.length || 0,
    capacity: 12,
    schedule: getScheduleForShift(shift),
    competencias,
    studentSlots: [],
  };
}

// Gera os slots de 30 minutos dentro de um periodo
function generateTimeSlots(start: string, end: string): string[] {
  const slots: string[] = [];
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (currentMinutes < endMinutes) {
    const h = Math.floor(currentMinutes / 60);
    const m = currentMinutes % 60;
    slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    currentMinutes += 30;
  }

  return slots;
}

// Conta quantos alunos estao em um slot especifico
function countStudentsInSlot(studentSlots: StudentSlot[], slotTime: string): number {
  return studentSlots.filter((slot) => {
    const [slotH, slotM] = slotTime.split(':').map(Number);
    const [startH, startM] = slot.start.split(':').map(Number);
    const [endH, endM] = slot.end.split(':').map(Number);

    const slotMinutes = slotH * 60 + slotM;
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    return slotMinutes >= startMinutes && slotMinutes < endMinutes;
  }).length;
}

// Verifica disponibilidade em um periodo
function checkSlotAvailability(
  studentSlots: StudentSlot[],
  start: string,
  end: string,
): { available: boolean; slots: Record<string, number> } {
  const slotsToCheck = generateTimeSlots(start, end);
  const slotCounts: Record<string, number> = {};
  let available = true;

  for (const slot of slotsToCheck) {
    const count = countStudentsInSlot(studentSlots, slot);
    slotCounts[slot] = count;
    if (count >= MAX_STUDENTS_PER_SLOT) {
      available = false;
    }
  }

  return { available, slots: slotCounts };
}

export const classService = {
  async getAll(): Promise<Class[]> {
    try {
      const { data } = await api.get<{ classes: ClassFromBackend[] }>('/classes');
      return data.classes.map(fromBackend);
    } catch (error) {
      console.error('[classService] Error fetching classes:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Class | null> {
    try {
      const { data } = await api.get<ClassFromBackend>(`/class/${id}`);
      return fromBackend(data);
    } catch (error) {
      console.error('[classService] Error fetching class by id:', error);
      return null;
    }
  },

  // Busca turmas por competencia (serie do aluno)
  async getByCompetencia(competencia: string): Promise<Class[]> {
    const all = await this.getAll();
    return all.filter((c) => c.competencias.includes(competencia));
  },

  // Verifica disponibilidade de um horario em uma turma
  async checkAvailability(
    classId: string,
    start: string,
    end: string,
  ): Promise<{ available: boolean; slots: Record<string, number> }> {
    const cls = await this.getById(classId);
    if (!cls) throw new Error('Turma nao encontrada');
    return checkSlotAvailability(cls.studentSlots, start, end);
  },

  // Adiciona um aluno a um horario da turma
  async addStudentToSlot(
    classId: string,
    studentId: string,
    studentName: string,
    start: string,
    end: string,
  ): Promise<Class> {
    console.warn('[classService] addStudentToSlot: Funcionalidade gerenciada pelo backend');
    const cls = await this.getById(classId);
    if (!cls) throw new Error('Turma nao encontrada');
    return cls;
  },

  // Remove um aluno de um horario da turma
  async removeStudentFromSlot(classId: string, studentId: string): Promise<Class> {
    console.warn('[classService] removeStudentFromSlot: Funcionalidade gerenciada pelo backend');
    const cls = await this.getById(classId);
    if (!cls) throw new Error('Turma nao encontrada');
    return cls;
  },

  // Obtem a ocupacao por horario de uma turma
  getSlotOccupancy(cls: Class): Record<string, number> {
    const slots = generateTimeSlots(cls.schedule.start, cls.schedule.end);
    const occupancy: Record<string, number> = {};

    for (const slot of slots) {
      occupancy[slot] = countStudentsInSlot(cls.studentSlots, slot);
    }

    return occupancy;
  },

  async create(
    data: Omit<Class, 'id' | 'studentCount' | 'capacity' | 'schedule' | 'studentSlots'>,
  ): Promise<Class> {
    try {
      const payload = {
        name: data.name,
        shift: data.shift,
        teacherId: data.teacherId,
      };

      const { data: response } = await api.post('/class', payload);

      if (response.classId) {
        const created = await this.getById(response.classId);
        if (created) return created;
      }

      return {
        id: response.classId || `temp-${Date.now()}`,
        name: data.name,
        shift: data.shift,
        teacherId: data.teacherId,
        studentCount: 0,
        capacity: 12,
        schedule: getScheduleForShift(data.shift),
        competencias: data.competencias || [],
        studentSlots: [],
      };
    } catch (error) {
      console.error('[classService] Error creating class:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/class/${id}`);
    } catch (error) {
      console.error('[classService] Error deleting class:', error);
      throw error;
    }
  },

  async update(id: string, data: Partial<Class>): Promise<Class> {
    try {
      const payload: Record<string, any> = {};
      if (data.name) payload.name = data.name;
      if (data.shift) payload.shift = data.shift;
      if (data.teacherId !== undefined) payload.teacherId = data.teacherId;

      await api.put(`/class/${id}`, payload);

      const updated = await this.getById(id);
      if (!updated) throw new Error('Turma nao encontrada apos atualizacao');
      return updated;
    } catch (error) {
      console.error('[classService] Error updating class:', error);
      throw error;
    }
  },

  // Atualiza as competencias da turma baseado no professor
  async syncCompetenciasWithTeacher(classId: string): Promise<Class> {
    const cls = await this.getById(classId);
    if (!cls) throw new Error('Turma nao encontrada');
    return cls;
  },

  // Limpa slots de alunos que nao existem mais no sistema
  async cleanupOrphanedSlots(): Promise<void> {
    console.log('[classService] cleanupOrphanedSlots: Gerenciado pelo backend');
  },

  MAX_STUDENTS_PER_SLOT,
  generateTimeSlots,
  checkSlotAvailability,
};

