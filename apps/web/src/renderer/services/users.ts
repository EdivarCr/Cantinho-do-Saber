/**
 * Users API Service
 * Connects to backend API endpoints for user management
 */

import { api } from './api';

/**
 * Creates a new user
 * @param payload - User data (name, email, password, profileId)
 * @returns Created user
 */
export async function createUser(payload: {
  name: string;
  email: string;
  password: string;
  profileId: string;
}) {
  const { data } = await api.post('/users', payload);
  return data;
}

/**
 * Finds a user by email
 * @param email - User email
 * @returns User object
 */
export async function findUserByEmail(email: string) {
  const { data } = await api.get(`/users/${email}`);
  return data;
}

/**
 * Gets the current logged-in user
 * @returns Current user object
 */
export async function getCurrentUser() {
  const { data } = await api.get('/users/me');
  return data;
}

/**
 * Updates a user
 * @param id - User ID
 * @param payload - Updated user data
 * @returns Updated user
 */
export async function updateUser(id: string, payload: any) {
  const { data } = await api.put(`/users/${id}`, payload);
  return data;
}

/**
 * Deletes a user (soft delete)
 * @param id - User ID
 */
export async function deleteUser(id: string) {
  const { data } = await api.delete(`/users/${id}`);
  return data;
}
