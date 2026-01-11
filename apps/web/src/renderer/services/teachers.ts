/**
 * Teachers API Service
 * Connects to backend API endpoints for teacher management
 */

import { api } from './api';

/**
 * Lists all teachers with optional filters
 * @param params - Optional query parameters (page, query, status)
 * @returns Object with teachers array
 */
export async function listTeachers(params?: { page?: number; query?: string; status?: string }) {
  const { data } = await api.get('/teachers', { params });
  return data;
}

/**
 * Gets a teacher by ID
 * @param id - Teacher ID
 * @returns Teacher object
 */
export async function getTeacherById(id: string) {
  const { data } = await api.get(`/teachers/${id}`);
  return data;
}

/**
 * Creates a new teacher
 * @param payload - Teacher data
 * @returns Created teacher with generated password
 */
export async function createTeacher(payload: any) {
  const { data } = await api.post('/teachers', payload);
  return data;
}

/**
 * Updates an existing teacher
 * @param id - Teacher ID
 * @param payload - Updated teacher data
 * @returns Updated teacher
 */
export async function updateTeacher(id: string, payload: any) {
  const { data } = await api.put(`/teachers/${id}`, payload);
  return data;
}

/**
 * Deletes a teacher (soft delete by setting status to INATIVO)
 * @param id - Teacher ID
 */
export async function deleteTeacher(id: string) {
  const { data } = await api.put(`/teachers/${id}`, { status: 'INATIVO' });
  return data;
}
