/**
 * Attendance API Service
 * Connects to backend API endpoints for attendance management
 */

import { api } from './api';

/**
 * Registers attendance for a student in a lesson
 * @param payload - Attendance data (studentId, lessonId, status)
 * @returns Registered attendance
 */
export async function registerAttendance(payload: {
  studentId: string;
  lessonId: string;
  status: 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO';
}) {
  const { data } = await api.post('/attendances', payload);
  return data;
}

/**
 * Gets attendance by ID
 * @param id - Attendance ID
 * @returns Attendance object
 */
export async function getAttendanceById(id: string) {
  const { data } = await api.get(`/attendances/${id}`);
  return data;
}

/**
 * Gets attendance history for a student
 * @param studentId - Student ID
 * @returns Array of attendance records
 */
export async function getAttendanceHistory(studentId: string) {
  const { data } = await api.get(`/students/${studentId}/attendances`);
  return data;
}

/**
 * Updates an attendance record
 * @param id - Attendance ID
 * @param payload - Updated attendance data
 * @returns Updated attendance
 */
export async function updateAttendance(id: string, payload: any) {
  const { data } = await api.put(`/attendances/${id}`, payload);
  return data;
}

/**
 * Deletes an attendance record
 * @param id - Attendance ID
 */
export async function deleteAttendance(id: string) {
  const { data } = await api.delete(`/attendances/${id}`);
  return data;
}
