/**
 * Classes API Service
 * Connects to backend API endpoints for class management
 */

import { api } from './api';

/**
 * Lists all classes
 * @returns Object with classes array
 */
export async function listClasses() {
  const { data } = await api.get('/classes');
  return data;
}

/**
 * Gets a class by ID
 * @param id - Class ID
 * @returns Class object
 */
export async function getClassById(id: string) {
  const { data } = await api.get(`/class/${id}`);
  return data;
}

/**
 * Creates a new class
 * @param payload - Class data
 * @returns Created class
 */
export async function createClass(payload: any) {
  const { data } = await api.post('/class', payload);
  return data;
}

/**
 * Updates an existing class
 * @param id - Class ID
 * @param payload - Updated class data
 * @returns Updated class
 */
export async function updateClass(id: string, payload: any) {
  const { data } = await api.put(`/class/${id}`, payload);
  return data;
}

/**
 * Deletes a class (soft delete)
 * @param id - Class ID
 */
export async function deleteClass(id: string) {
  const { data } = await api.delete(`/class/${id}`);
  return data;
}
