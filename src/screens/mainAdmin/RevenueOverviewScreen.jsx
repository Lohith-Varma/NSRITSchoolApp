import React from 'react';
import {EmptyState, ERPLayout} from '../../components';

const RevenueOverviewScreen = ({navigation}) => (
  <ERPLayout
    navigation={navigation}
    activeRoute="Reports"
    title="Revenue Overview"
    breadcrumbs={['Dashboard', 'Analytics', 'Revenue']}>
    <EmptyState
      title="Revenue is out of scope"
      message="Payment and fee gateway work is intentionally excluded."
    />
  </ERPLayout>
);

export default RevenueOverviewScreen;
