import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {Button, Card, Text} from 'react-native-paper';
import {EmptyState, Header, LoadingScreen, ScreenContainer} from '../../components';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors, radius, spacing, typography} from '../../theme';

const PAGE_SIZE = 50;

const AuditLogsScreen = ({route}) => {
  const user = useSelector(state => state.auth.user);
  const [offset, setOffset] = useState(0);
  const branchId = route?.params?.branchId || user?.mainAdminBranchContext?.branchId || null;
  const logsQuery = useQuery({
    queryKey: ['auditLogs', branchId, offset],
    queryFn: () => mainAdminService.getAuditLogs({branchId, limit: PAGE_SIZE, offset}),
  });

  if (logsQuery.isLoading && !logsQuery.data) {
    return <LoadingScreen message="Loading audit logs" />;
  }

  const logs = logsQuery.data || [];

  return (
    <ScreenContainer>
      <Header
        title="Audit Logs"
        subtitle={branchId ? 'Main Admin actions in selected branch' : 'Main Admin actions across branches'}
      />
      {logsQuery.error ? (
        <EmptyState title="Unable to load audit logs" message={logsQuery.error.message} />
      ) : null}
      {logs.length ? (
        logs.map(item => (
          <Card key={item.id} mode="outlined" style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>{item.action}</Text>
              <Text style={styles.detail}>Performed By: {item.performedBy}</Text>
              <Text style={styles.detail}>Performed Role: {item.performedRole}</Text>
              <Text style={styles.detail}>Acting As: {item.actingAs || item.performedRole}</Text>
              <Text style={styles.detail}>Branch: {item.branchId || 'Global'}</Text>
              <Text style={styles.detail}>Entity: {item.entityType || '-'} {item.entityId || ''}</Text>
              <Text style={styles.time}>{item.createdAt}</Text>
            </Card.Content>
          </Card>
        ))
      ) : (
        <EmptyState title="No audit logs" message="Main Admin actions will appear here." />
      )}
      <View style={styles.pagination}>
        <Button
          mode="outlined"
          disabled={offset === 0}
          onPress={() => setOffset(current => Math.max(0, current - PAGE_SIZE))}>
          Previous
        </Button>
        <Button
          mode="outlined"
          disabled={logs.length < PAGE_SIZE}
          onPress={() => setOffset(current => current + PAGE_SIZE)}>
          Next
        </Button>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
  },
  detail: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  time: {
    color: colors.primary,
    marginTop: spacing.sm,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
});

export default AuditLogsScreen;
