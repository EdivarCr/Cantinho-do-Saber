/**
 * Students API Service
 * Connects to backend API endpoints for student management
 */

import { api } from './api';

/**
 * Lists all students or searches by name
 * @param name - Optional name to filter students
 * @returns Array of students
 */
export async function listStudents(name = '') {
  const { data } = await api.get('/students/search', {
    params: { studentName: name },
  });
  return data;
}

/**
 * Gets a student by ID
 * @param id - Student ID
 * @returns Student object
 */
export async function getStudentById(id: string) {
  const { data } = await api.get(`/students/${id}`);
  return data;
}

/**
 * Searches students by name
 * @param name - Student name to search
 * @returns Array of matching students
 */
export async function searchStudentsByName(name: string) {
  const { data } = await api.get('/students/search', {
    params: { studentName: name },
  });
  return data;
}

/**
 * Creates a new student
 * @param payload - Student data
 * @returns Created student with ID
 */
export async function createStudent(payload: any) {
  const { data } = await api.post('/students', payload);
  return data;
}

/**
 * Updates an existing student
 * @param id - Student ID
 * @param payload - Updated student data
 * @returns Updated student
 */
export async function updateStudent(id: string, payload: any) {
  const { data } = await api.put(`/student/${id}`, payload);
  return data;
}

/**
 * Deletes a student (soft delete)
 * @param id - Student ID
 */
export async function deleteStudent(id: string) {
  const { data } = await api.delete(`/students/${id}`);
  return data;
}

/**
 * Gets the total count of students
 * @returns Number of students
 */
export async function getStudentsCount() {
  const { data } = await api.get('/students/count');
  return data;
}
