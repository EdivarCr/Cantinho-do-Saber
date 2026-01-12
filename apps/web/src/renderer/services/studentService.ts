/**
 * Student Service - Real API Integration
 * Uses backend API endpoints for student management
 */

import { api } from './api';

// ============================================================================
// INTERFACES
// ============================================================================

// Modelo de leitura (O que a Lista e o Detalhe usam)
export interface Student {
  id: string;
  name: string;
  birthDate: string;
  grade: string;
  class: string;
  schoolType: string;
  teacher: string;
  monthlyFee: number;

  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
  };

  guardian: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
    address: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
    };
  };

  enrollmentDate: string;
  status: 'active' | 'inactive';
}

// Modelo de formulario (O que o Form de Cadastro/Edicao usa)
export interface StudentFormData {
  name: string;
  birthDate: string;
  grade: string;
  schoolType: 'publica' | 'particular';
  class: string;
  teacher: string;
  monthlyFee: number;
  address: {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
  };
  guardian: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
    address: {
      street: string;
      number: string;
      complement: string;
      neighborhood: string;
    };
  };
  status?: 'active' | 'inactive';
  enrollmentDate?: string;
}

// Interface que vem do backend
interface GuardianFromBackend {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  kinship: string;
}

interface AddressFromBackend {
  id: string;
  street: string;
  number: string;
  district: string;
  complement?: string | null;
  city?: string | null;
  state?: string | null;
}

interface StudentFromBackend {
  id: string;
  name: string;
  birthDate: string;
  classId: string;
  currentGrade: string;
  class?: {
    id: string;
    name: string;
    shift: string;
    teacher?: {
      id: string;
      name: string;
      email: string;
      phone: string;
      qualifiedGrades: string[];
    } | null;
  } | null;
  guardians?: GuardianFromBackend[];
  addresses?: AddressFromBackend[];
  addressIds: string[];
  guardianIds: string[];
  enrollmentIds: string[];
  attendanceIds: string[];
  createdAt: string;
}

// Mapeamento de grade do backend para frontend
const GRADE_MAP: Record<string, string> = {
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

// Mapeamento de kinship para relacionamento em português
const KINSHIP_TO_RELATIONSHIP: Record<string, string> = {
  PAI_MAE: 'Pai/Mãe',
  AVOS: 'Avós',
  TIOS: 'Tios',
  IRMAOS: 'Irmãos',
  OUTRO: 'Outro',
};

// Converte do formato backend para frontend
function fromBackend(s: StudentFromBackend): Student {
  // Pega o primeiro responsável (principal)
  const firstGuardian = s.guardians?.[0];
  // Pega o primeiro endereço do aluno
  const firstAddress = s.addresses?.[0];

  return {
    id: s.id,
    name: s.name,
    birthDate: s.birthDate,
    grade: GRADE_MAP[s.currentGrade] || s.currentGrade,
    class: s.class?.name || s.classId || '',
    schoolType: 'particular',
    teacher: s.class?.teacher?.name || '',
    monthlyFee: 0,
    address: {
      street: firstAddress?.street || '',
      number: firstAddress?.number || '',
      complement: firstAddress?.complement || '',
      neighborhood: firstAddress?.district || '',
    },
    guardian: {
      name: firstGuardian?.name || '',
      relationship:
        KINSHIP_TO_RELATIONSHIP[firstGuardian?.kinship || ''] || firstGuardian?.kinship || '',
      phone: firstGuardian?.phone || '',
      email: firstGuardian?.email || '',
      address: {
        street: firstAddress?.street || '',
        number: firstAddress?.number || '',
        complement: firstAddress?.complement || '',
        neighborhood: firstAddress?.district || '',
      },
    },
    enrollmentDate: s.createdAt,
    status: 'active',
  };
}

// Mapeamento de grade do frontend para backend
const GRADE_TO_BACKEND: Record<string, string> = {
  '1º Ano': 'PRIMEIRO_ANO',
  '2º Ano': 'SEGUNDO_ANO',
  '3º Ano': 'TERCEIRO_ANO',
  '4º Ano': 'QUARTO_ANO',
  '5º Ano': 'QUINTO_ANO',
  '6º Ano': 'SEXTO_ANO',
  '7º Ano': 'SETIMO_ANO',
  '8º Ano': 'OITAVO_ANO',
  '9º Ano': 'NONO_ANO',
  'series-1-ano': 'PRIMEIRO_ANO',
  'series-2-ano': 'SEGUNDO_ANO',
  'series-3-ano': 'TERCEIRO_ANO',
  'series-4-ano': 'QUARTO_ANO',
  'series-5-ano': 'QUINTO_ANO',
  'series-6-ano': 'SEXTO_ANO',
  'series-7-ano': 'SETIMO_ANO',
  'series-8-ano': 'OITAVO_ANO',
  'series-9-ano': 'NONO_ANO',
};

// ============================================================================
// SERVICE
// ============================================================================

// Converte data de YYYY-MM-DD para DD/MM/YYYY
function formatDateForBackend(dateStr: string): string {
  if (dateStr.includes('/')) return dateStr; // Já está no formato correto
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

// Mapeia relationship do frontend para Kinship do backend
const KINSHIP_MAP: Record<string, string> = {
  pai: 'PAI_MAE',
  mae: 'PAI_MAE',
  'pai/mae': 'PAI_MAE',
  avo: 'AVOS',
  avos: 'AVOS',
  tio: 'TIOS',
  tios: 'TIOS',
  irmao: 'IRMAOS',
  irmaos: 'IRMAOS',
  outro: 'OUTRO',
};

export const studentService = {
  // CRIAR ALUNO
  async createStudent(data: StudentFormData): Promise<{ id: string }> {
    try {
      const payload = {
        name: data.name,
        birthDate: formatDateForBackend(data.birthDate),
        currentGrade: GRADE_TO_BACKEND[data.grade] || data.grade,
        classId: data.class,
        studentAddress: {
          street: data.address.street || 'Não informado',
          number: data.address.number || 'S/N',
          district: data.address.neighborhood || 'Não informado',
          complement: data.address.complement || undefined,
        },
        guardianAddress: {
          street: data.guardian.address?.street || data.address.street || 'Não informado',
          number: data.guardian.address?.number || data.address.number || 'S/N',
          district:
            data.guardian.address?.neighborhood || data.address.neighborhood || 'Não informado',
          complement: data.guardian.address?.complement || undefined,
        },
        guardian: {
          name: data.guardian.name || 'Responsável',
          kinship: KINSHIP_MAP[data.guardian.relationship?.toLowerCase()] || 'PAI_MAE',
          phone: data.guardian.phone || '00000000000',
          email: data.guardian.email || null,
        },
      };

      console.log('[studentService] Creating student with payload:', payload);
      const { data: response } = await api.post('/students', payload);
      return { id: response.studentId || response.id };
    } catch (error) {
      console.error('[studentService] Error creating student:', error);
      throw error;
    }
  },

  // BUSCAR POR NOME
  async searchStudentsByName(studentName: string): Promise<Student[]> {
    try {
      // O backend agora aceita string vazia para listar todos os alunos
      const { data } = await api.get<StudentFromBackend[]>('/students/search', {
        params: { studentName: studentName.trim() },
      });
      return data.map(fromBackend);
    } catch (error) {
      console.error('[studentService] Error searching students:', error);
      return [];
    }
  },

  // BUSCAR POR ID
  async getStudentById(id: string): Promise<Student> {
    try {
      const { data } = await api.get<StudentFromBackend>(`/student/${id}`);
      return fromBackend(data);
    } catch (error) {
      console.error('[studentService] Error fetching student:', error);
      throw new Error('Aluno nao encontrado');
    }
  },

  // ATUALIZAR ALUNO
  async updateStudent(id: string, data: Partial<StudentFormData>): Promise<void> {
    try {
      const payload: Record<string, any> = {};

      if (data.name) payload.name = data.name;
      if (data.birthDate) payload.birthDate = data.birthDate;
      if (data.grade) payload.currentGrade = GRADE_TO_BACKEND[data.grade] || data.grade;
      if (data.class) payload.classId = data.class;
      if (data.status) payload.status = data.status === 'active' ? 'ATIVO' : 'INATIVO';

      await api.put(`/student/${id}`, payload);
    } catch (error) {
      console.error('[studentService] Error updating student:', error);
      throw error;
    }
  },

  // DELETAR ALUNO
  async deleteStudent(id: string): Promise<void> {
    try {
      await api.delete(`/student/${id}`);
    } catch (error) {
      console.error('[studentService] Error deleting student:', error);
      throw error;
    }
  },

  // COUNT
  async getStudentsCount(): Promise<number> {
    try {
      const { data } = await api.get<{ count: number }>('/student/report/count');
      return data.count;
    } catch (error) {
      console.error('[studentService] Error getting count:', error);
      return 0;
    }
  },

  // LISTAR TODOS
  async getAll(): Promise<Student[]> {
    return this.searchStudentsByName('');
  },
};

