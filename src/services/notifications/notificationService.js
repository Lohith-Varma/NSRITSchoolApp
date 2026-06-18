import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';

export const notificationService = {
  async getNotifications({userId, limit = 30, offset = 0}) {
    try {
      const response = await dataConnectClient.query(
        DATA_CONNECT_QUERIES.GET_NOTIFICATIONS_BY_USER,
        {userId, limit, offset},
      );
      return response.notifications || [];
    } catch (error) {
      console.log('[Notifications] Fetch failed:', error);
      return [];
    }
  },

  async getUnreadCount(userId) {
    try {
      const response = await dataConnectClient.query(
        DATA_CONNECT_QUERIES.GET_UNREAD_NOTIFICATION_COUNT,
        {userId},
      );
      return (response.notifications || []).length;
    } catch (error) {
      console.log('[Notifications] Unread count failed:', error);
      return 0;
    }
  },

  async markRead(notificationId) {
    try {
      await dataConnectClient.mutate(
        DATA_CONNECT_MUTATIONS.MARK_NOTIFICATION_READ,
        {id: notificationId},
      );
    } catch (error) {
      console.log('[Notifications] Mark read failed:', error);
    }
  },

  async markAllRead(userId) {
    try {
      await dataConnectClient.mutate(
        DATA_CONNECT_MUTATIONS.MARK_ALL_NOTIFICATIONS_READ,
        {userId},
      );
    } catch (error) {
      console.log('[Notifications] Mark all read failed:', error);
    }
  },

  async createNotification({userId, branchId, title, message, audienceRole}) {
    try {
      const response = await dataConnectClient.mutate(
        DATA_CONNECT_MUTATIONS.CREATE_NOTIFICATION,
        {userId, branchId, title, message, audienceRole: audienceRole || 'PARENT'},
      );
      return response.notification_insert;
    } catch (error) {
      console.log('[Notifications] Create failed:', error);
    }
  },

  // Broadcast a notification to a target audience within a branch.
  // target: 'all' | 'parents' | 'teachers' | 'students'
  // Returns {sent, failed} counts.
  async broadcastNotification({branchId, title, message, target = 'all'}) {
    if (!branchId) {throw new Error('branchId required for broadcast');}
    const userIds = new Set();

    try {
      const includeStaff = target === 'all' || target === 'teachers';
      const includeParents = target === 'all' || target === 'parents' || target === 'students';

      const [staffRes, studentsRes] = await Promise.all([
        includeStaff
          ? dataConnectClient.query(DATA_CONNECT_QUERIES.GET_BRANCH_STAFF_USER_IDS, {branchId, limit: 500})
          : Promise.resolve(null),
        includeParents
          ? dataConnectClient.query(DATA_CONNECT_QUERIES.GET_BRANCH_STUDENTS_WITH_PARENTS, {branchId, limit: 1000})
          : Promise.resolve(null),
      ]);

      if (staffRes?.users) {
        staffRes.users.forEach(u => u?.id && userIds.add(u.id));
      }
      if (studentsRes?.students) {
        studentsRes.students.forEach(s => {
          (s?.linkedParents || []).forEach(lp => lp?.userId && userIds.add(lp.userId));
        });
      }
    } catch (err) {
      console.log('[Notifications] Broadcast user fetch failed:', err);
      throw err;
    }

    if (!userIds.size) {return {sent: 0, failed: 0};}

    const results = await Promise.allSettled(
      [...userIds].map(uid =>
        this.createNotification({userId: uid, branchId, title, message, audienceRole: target.toUpperCase()}),
      ),
    );
    const sent = results.filter(r => r.status === 'fulfilled' && r.value).length;
    const failed = results.length - sent;
    console.log(`[Notifications] Broadcast sent ${sent}/${userIds.size}, failed ${failed}`);
    return {sent, failed};
  },

  // Called after attendance is saved — creates notifications for absent students' parents.
  // absentStudents: [{id, fullName, parent: {userId}, branchId, academicClass: {name}, section: {name}}]
  async notifyAbsentStudentsParents({absentStudents = [], attendanceDate, markedByName}) {
    if (!absentStudents.length) {return;}
    const dateLabel = attendanceDate
      ? new Date(attendanceDate + 'T00:00:00').toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : attendanceDate;

    const results = await Promise.allSettled(
      absentStudents.map(student => {
        const parentUserId = student?.parent?.userId;
        if (!parentUserId) {return Promise.resolve(null);}
        const className = student?.academicClass?.name || '';
        const sectionName = student?.section?.name || '';
        const classLabel = className && sectionName ? `${className}-${sectionName}` : className || sectionName;
        return this.createNotification({
          userId: parentUserId,
          branchId: student.branchId,
          title: 'Attendance Alert',
          message: `Your child ${student.fullName} was marked absent on ${dateLabel}${classLabel ? ` (Class ${classLabel})` : ''}. Please contact the school if this is incorrect.`,
          audienceRole: 'PARENT',
        });
      }),
    );

    const created = results.filter(r => r.status === 'fulfilled' && r.value).length;
    console.log(`[Notifications] Created ${created}/${absentStudents.length} absence notifications`);
    return created;
  },
};

export default notificationService;
