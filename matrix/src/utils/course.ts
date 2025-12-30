import type { Course } from '../types/api';

/**
 * Safely extracts instructor name from Course object
 * Backend can return instructor as either:
 * - string (legacy format)
 * - { name: string | null } (new format)
 */
export const getInstructorName = (instructor: Course['instructor']): string => {
  if (typeof instructor === 'string') {
    return instructor;
  }
  return instructor?.name || 'Unknown Instructor';
};

/**
 * Gets instructor initials for avatar display
 */
export const getInstructorInitials = (instructor: Course['instructor']): string => {
  const name = getInstructorName(instructor);
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

