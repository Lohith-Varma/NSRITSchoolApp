import React from 'react';
import {EmptyState, ERPLayout} from '../../components';

const AuditLogsScreen = ({navigation}) => (
  <ERPLayout
    navigation={navigation}
    activeRoute="Profile"
    title="Audit Logs"
    breadcrumbs={['Dashboard', 'System', 'Audit Logs']}>
    <EmptyState
      title="Audit logs are out of scope"
      message="This phase intentionally avoids audit systems."
    />
  </ERPLayout>
);

export default AuditLogsScreen;
