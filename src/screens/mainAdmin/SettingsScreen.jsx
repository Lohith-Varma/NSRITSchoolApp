import React from 'react';
import {EmptyState, Header, ERPLayout} from '../../components';

const SettingsScreen = ({navigation}) => (
  <ERPLayout
    navigation={navigation}
    activeRoute="Profile"
    title="Settings"
    breadcrumbs={['Dashboard', 'System', 'Settings']}>
    <Header title="Settings" subtitle="Global app configuration" />
    <EmptyState
      title="No settings yet"
      message="Configuration screens can be expanded after core operations stabilize."
    />
  </ERPLayout>
);

export default SettingsScreen;
