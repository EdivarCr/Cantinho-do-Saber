/**
 * Lessons API Service
 * Connects to backend API endpoints for lesson management
 */

import { api } from './api';

/**
 * Lists all lessons
 * @returns Object with lessons array
 */
export async function listLessons() {
  const { data } = await api.get('/lessons');
  return data;
}

/**
 * Gets lessons for a specific class
 * @param classId - Class ID
 * @returns Object with lessons array
 */
export async function listLessonsByClass(classId: string) {
  const { data } = await api.get(`/classes/${classId}/lessons`);
  return data;
}

/**
 * Gets a lesson by ID
 * @param id - Lesson ID
 * @returns Lesson object
 */
export async function getLessonById(id: string) {
  const { data } = await api.get(`/lessons/${id}`);
  return data;
}

/**
 * Creates a new lesson
 * @param payload - Lesson data (classId, date, startTime, endTime, duration)
 * @returns Created lesson
 */
export async function createLesson(payload: any) {
  const { data } = await api.post('/lessons', payload);
  return data;
}

/**
 * Updates an existing lesson
 * @param id - Lesson ID
 * @param payload - Updated lesson data
 * @returns Updated lesson
 */
export async function updateLesson(id: string, payload: any) {
  const { data } = await api.put(`/lessons/${id}`, payload);
  return data;
}

/**
 * Deletes a lesson (soft delete)
 * @param id - Lesson ID
 */
export async function deleteLesson(id: string) {
  const { data } = await api.delete(`/lessons/${id}`);
  return data;
}
