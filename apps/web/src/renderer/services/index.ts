/**
 * Services Barrel Export
 * Central export point for all API services
 */

// Auth service
export * from './auth';

// API client
export { api } from './api';

// Domain services
export * from './students';
export * from './teachers';
export * from './classes';
export * from './lessons';
export * from './attendance';
export * from './users';

// Legacy services (to be phased out)
export { studentService } from './studentService';
export { teacherService } from './teacherService';
export { classService } from './classService';
export { userService } from './userService';
export { attendanceService } from './attendanceService';
