import {ATTENDANCE_STATUS} from '../../config/constants';

export const normalizeAttendanceStatus = status => {
  if (!status) return null;
  
  const normalized = String(status).trim().toUpperCase();

  switch (normalized) {
    case 'PRESENT':
      return ATTENDANCE_STATUS.PRESENT;
    case 'ABSENT':
      return ATTENDANCE_STATUS.ABSENT;
    case 'LATE':
      return ATTENDANCE_STATUS.LATE;
    case 'HALF_DAY':
      return 'HALF_DAY'; // Assuming this might be used later
    case 'HOLIDAY':
      return 'holiday';
    case 'FUTURE':
      return 'future';
    default:
      return null;
  }
};
