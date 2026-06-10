import {isValidPredefinedClass} from '../config/academic';
import {normalizePhoneNumber} from './phone';

export const validateStudentPayload = payload => {
  if (!payload.fullName?.trim()) {
    return 'Student name is required';
  }

  if (!payload.gender?.trim()) {
    return 'Gender is required';
  }

  if (!payload.dateOfBirth) {
    return 'Date of birth is required';
  }

  if (!payload.admissionDate) {
    return 'Admission date is required';
  }

  if (!payload.fatherName?.trim()) {
    return 'Father name is required';
  }

  if (!payload.motherName?.trim()) {
    return 'Mother name is required';
  }

  if (normalizePhoneNumber(payload.parentPhoneNumber).length < 10) {
    return 'Valid parent phone number is required';
  }

  if (!isValidPredefinedClass(payload.className)) {
    return 'Select a valid predefined class';
  }

  if (!payload.branchId) {
    return 'Branch is required';
  }

  if (!payload.branchCode) {
    return 'Branch code is required';
  }

  if (!payload.academicClassId) {
    return 'Class ID is required';
  }

  if (!payload.wingId || !payload.wingCode) {
    return 'Class wing is required. Please reselect the class.';
  }

  if (!payload.sectionId && !payload.sectionName) {
    return 'Section is required';
  }

  if (!payload.admissionYear) {
    return 'Admission year is required';
  }

  return '';
};
