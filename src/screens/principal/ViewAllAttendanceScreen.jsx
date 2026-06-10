import React from 'react';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {DashboardCard, EmptyState, Header, ScreenContainer} from '../../components';
import attendanceService from '../../services/attendance/attendanceService';

const ViewAllAttendanceScreen = () => {
  const user = useSelector(state => state.auth.user);
  const {data: items = [], error, isLoading} = useQuery({
    queryKey: ['branchAttendance', user?.branchId],
    queryFn: () => attendanceService.getAttendance({branchId: user.branchId}),
    enabled: Boolean(user?.branchId),
  });

  return (
    <ScreenContainer>
      <Header title="All Attendance" subtitle={isLoading ? 'Loading submitted attendance' : 'Principal read-only attendance view'} />
      {error ? <EmptyState title="Unable to load attendance" message={error.message} /> : null}
      {items.length ? (
        items.map(item => (
          <DashboardCard
            key={item.id}
            title={item.student?.fullName || item.studentId}
            value={item.attendanceDate}
            description={`${item.academicClass?.name || '-'}-${item.section?.name || '-'} | ${item.status} | Submitted by ${item.markedBy?.fullName || '-'}`}
            icon="clipboard-text-outline"
          />
        ))
      ) : (
        <EmptyState title="No attendance submitted" message="Teacher submissions will appear here." />
      )}
    </ScreenContainer>
  );
};

export default ViewAllAttendanceScreen;
