import {USER_ROLES, ATTENDANCE_STATUS} from '../../config/constants';
import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';
import {normalizeAttendanceStatus} from '../../utils/helpers/attendanceHelpers';

const today = () => new Date().toISOString().slice(0, 10);

export const summarizeAttendance = records => {
  const normalizedRecords = records.map(item => ({
    ...item,
    status: normalizeAttendanceStatus(item.status) || item.status,
  }));
  const present = normalizedRecords.filter(item => item.status === ATTENDANCE_STATUS.PRESENT || String(item.status).toUpperCase() === 'PRESENT').length;
  const absent = normalizedRecords.filter(item => item.status === ATTENDANCE_STATUS.ABSENT || String(item.status).toUpperCase() === 'ABSENT').length;
  const total = present + absent;
  return {
    present,
    absent,
    total,
    percentage: total ? Math.round((present / total) * 100) : 0,
  };
};

export const attendanceService = {
  async getAttendance(filters = {}) {
    try {
      if (filters.studentId && filters.fromDate && filters.toDate) {
        const response = await dataConnectClient.query(
          DATA_CONNECT_QUERIES.GET_ATTENDANCE_BY_MONTH,
          filters,
        );
        return (response.attendances || []).map(record => ({
          ...record,
          status: normalizeAttendanceStatus(record.status) || record.status,
        }));
      }

      if (filters.sectionId && filters.attendanceDate) {
        const response = await dataConnectClient.query(
          DATA_CONNECT_QUERIES.GET_ATTENDANCE_BY_SECTION,
          filters,
        );
        return (response.attendances || []).map(record => ({
          ...record,
          status: normalizeAttendanceStatus(record.status) || record.status,
        }));
      }

      if (filters.branchId) {
        const response = await dataConnectClient.query(
          DATA_CONNECT_QUERIES.GET_ATTENDANCE_BY_BRANCH,
          {
            branchId: filters.branchId,
            fromDate: filters.fromDate || '2000-01-01',
            toDate: filters.toDate || today(),
            limit: filters.limit || 500,
            offset: filters.offset || 0,
          },
        );
        return (response.attendances || []).map(record => ({
          ...record,
          status: normalizeAttendanceStatus(record.status) || record.status,
        }));
      }

      return [];
    } catch (error) {
      console.log('[Attendance] Query failed:', {filters, error});
      throw error;
    }
  },

  async getSectionAttendanceMap({sectionId, attendanceDate}) {
    const records = await this.getAttendance({sectionId, attendanceDate});
    return records.reduce((acc, record) => ({...acc, [record.studentId]: record}), {});
  },

  async markAttendance(payload, scope = {}) {
    const role = String(scope?.role || '').toUpperCase();
    const assignedSectionIds = scope?.assignedSectionIds || (scope?.sectionId ? [scope.sectionId] : []);
    if (
      role === USER_ROLES.TEACHER &&
      assignedSectionIds.length &&
      !assignedSectionIds.includes(payload.sectionId)
    ) {
      throw new Error('Teachers can mark attendance only for assigned sections.');
    }

    try {
      const response = await dataConnectClient.query(
        DATA_CONNECT_QUERIES.GET_ATTENDANCE_BY_SECTION,
        {
          sectionId: payload.sectionId,
          attendanceDate: payload.attendanceDate,
        },
      );
      const existingRecord = (response.attendances || []).find(
        item => item.studentId === payload.studentId,
      );

      if (existingRecord?.id) {
        const updateResponse = await dataConnectClient.mutate(
          DATA_CONNECT_MUTATIONS.UPDATE_ATTENDANCE,
          {
            id: existingRecord.id,
            status: normalizeAttendanceStatus(payload.status) || payload.status,
            editedById: payload.markedById,
            remarks: payload.remarks || null,
          },
        );
        const id = updateResponse.attendance_update?.id || updateResponse.attendance_update || existingRecord.id;
        return {...existingRecord, ...payload, id};
      }

      const createPayload = { ...payload, status: normalizeAttendanceStatus(payload.status) || payload.status };
      const createResponse = await dataConnectClient.mutate(
        DATA_CONNECT_MUTATIONS.CREATE_ATTENDANCE,
        createPayload,
      );
      return {id: createResponse.attendance_insert?.id || createResponse.attendance_insert, ...createPayload};
    } catch (error) {
      console.log('[Attendance] Save failed:', {payload, error});
      throw error;
    }
  },

  async saveAttendanceBatch({records = []}, scope = {}) {
    if (!records.length) {
      throw new Error('No attendance records to save.');
    }

    const role = String(scope?.role || '').toUpperCase();
    const assignedSectionIds = scope?.assignedSectionIds || (scope?.sectionId ? [scope.sectionId] : []);
    if (
      role === USER_ROLES.TEACHER &&
      assignedSectionIds.length &&
      records.some(record => !assignedSectionIds.includes(record.sectionId))
    ) {
      throw new Error('Teachers can mark attendance only for assigned sections.');
    }

    const existingBySectionDate = {};
    const uniqueKeys = [...new Set(records.map(record => `${record.sectionId}|${record.attendanceDate}`))];
    for (const key of uniqueKeys) {
      const [sectionId, attendanceDate] = key.split('|');
      existingBySectionDate[key] = await this.getSectionAttendanceMap({sectionId, attendanceDate});
    }

    const saved = [];
    for (const record of records) {
      const key = `${record.sectionId}|${record.attendanceDate}`;
      const existingRecord = existingBySectionDate[key]?.[record.studentId];
      if (existingRecord?.id) {
        const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UPDATE_ATTENDANCE, {
          id: existingRecord.id,
          status: normalizeAttendanceStatus(record.status) || record.status,
          editedById: record.markedById,
          remarks: record.remarks || null,
        });
        saved.push({
          ...existingRecord,
          ...record,
          id: response.attendance_update?.id || response.attendance_update || existingRecord.id,
        });
      } else {
        const createPayload = { ...record, status: normalizeAttendanceStatus(record.status) || record.status };
        const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_ATTENDANCE, createPayload);
        saved.push({id: response.attendance_insert?.id || response.attendance_insert, ...createPayload});
      }
    }
    return saved;
  },

  async correctAttendance({attendanceId, records, actorRole, scope}) {
    if (actorRole !== USER_ROLES.COORDINATOR) {
      throw new Error('Only coordinators can correct submitted attendance');
    }

    if (scope?.wingId && records?.some(record => record.wingId && record.wingId !== scope.wingId)) {
      throw new Error('Coordinators can edit attendance only inside their assigned wing.');
    }

    if (!records?.length) {
      throw new Error('No attendance records selected for correction');
    }

    const [record] = records;
    try {
      const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UPDATE_ATTENDANCE, {
        id: attendanceId,
        status: normalizeAttendanceStatus(record.status) || record.status,
        editedById: record.editedById,
        remarks: record.remarks,
      });

      return {id: response.attendance_update?.id || response.attendance_update, ...record};
    } catch (error) {
      console.log('[Attendance] Correction failed:', {attendanceId, record, error});
      throw error;
    }
  },

  summarizeAttendance,

  getAttendanceSummary(records = []) {
    return summarizeAttendance(records);
  },
};

export default attendanceService;
