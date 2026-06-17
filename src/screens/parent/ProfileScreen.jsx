import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {DashboardCard, EmptyState, Header, ScreenContainer, SectionHeader, StatusBadge} from '../../components';
import {ROLE_LABELS} from '../../config/constants';
import parentService from '../../services/parents/parentService';
import {spacing} from '../../theme';

const normalizeRole = role => String(role || '').toUpperCase();
const uniqueRoles = roles => [...new Set((roles || []).map(item => normalizeRole(item?.role || item)).filter(Boolean))];

const ProfileScreen = () => {
  const user = useSelector(state => state.auth.user);
  const parentId = user?.parentId;
  const {data: children = [], error, isLoading} = useQuery({
    queryKey: ['parentChildren', parentId],
    queryFn: () => parentService.getParentChildren(parentId),
    enabled: Boolean(parentId),
  });
  const parent = children[0]?.parent;
  const roles = uniqueRoles([...(user?.roles || []), user?.role]);

  return (
    <ScreenContainer>
      <Header title="Profile" subtitle={isLoading ? 'Loading parent profile' : 'Parent account details'} />
      <DashboardCard
        title={parent?.fullName || user?.name || 'Parent'}
        value={user?.role || 'PARENT'}
        description={parent?.phoneNumber || user?.phoneNumber || 'Phone number not available'}
      />
      <View style={styles.roleRow}>
        {roles.map(role => (
          <StatusBadge key={role} status="info" label={ROLE_LABELS[role] || role} />
        ))}
      </View>
      <DashboardCard title="Father" value={parent?.fatherName || '-'} icon="account-outline" />
      <DashboardCard title="Mother" value={parent?.motherName || '-'} icon="account-outline" />
      {error ? <EmptyState title="Unable to load linked children" message={error.message} /> : null}
      <SectionHeader title="Linked Children" />
      {children.length ? (
        children.map(child => (
          <DashboardCard
            key={child.id}
            title={child.fullName}
            value={child.studentId}
            description={`${child.parentRelationship || 'PARENT'} | ${child.academicClass?.name || '-'}-${child.section?.name || '-'} | Attendance ${child.attendanceSummary?.percentage || 0}% | Due ${child.feeSummary?.due || 0}`}
            icon="account-school-outline"
          />
        ))
      ) : (
        <EmptyState title="No linked children" message="Child linkage is read-only for parent accounts." />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
});

export default ProfileScreen;
