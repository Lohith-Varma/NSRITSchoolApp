import React from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {Text, Card} from 'react-native-paper';
import {ERPLayout, LoadingScreen} from '../../components';
import useAsyncResource from '../../hooks/useAsyncResource';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors, radius, spacing} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';

const GlobalAnalyticsScreen = ({navigation}) => {
  const {data: stats, loading} = useAsyncResource(
    options => mainAdminService.getDashboardStatistics(options),
    [],
  );

  if (loading && !stats) {
    return <LoadingScreen message="Loading Analytics..." />;
  }

  return (
    <ERPLayout
      navigation={navigation}
      activeRoute="Reports"
      title="Global Reports"
      breadcrumbs={['Dashboard', 'Analytics', 'Reports']}>
      <ScrollView style={styles.container}>
        <Text style={styles.sectionHeader}>Platform Performance & Growth</Text>
        <View style={styles.analyticsGrid}>
          <Card mode="outlined" style={styles.analyticsCard}>
            <Card.Content>
              <Text style={styles.analyticsCardTitle}>Branch Growth</Text>
              <Text style={styles.analyticsCardMetric}>+{stats?.totalBranches || 0} Registered</Text>
              <Text style={styles.analyticsCardDesc}>All school regions are running in stable cloud environments.</Text>
            </Card.Content>
          </Card>

          <Card mode="outlined" style={styles.analyticsCard}>
            <Card.Content>
              <Text style={styles.analyticsCardTitle}>Revenue Trend</Text>
              <Text style={styles.analyticsCardMetric}>{formatCurrency(stats?.revenue || 0)} Paid</Text>
              <Text style={styles.analyticsCardDesc}>Fee collection is active with average collections monitored.</Text>
            </Card.Content>
          </Card>

          <Card mode="outlined" style={styles.analyticsCard}>
            <Card.Content>
              <Text style={styles.analyticsCardTitle}>User Activity</Text>
              <Text style={styles.analyticsCardMetric}>{stats?.totalUsers || 0} Users Online</Text>
              <Text style={styles.analyticsCardDesc}>Live system connections and roles authenticated without errors.</Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </ERPLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    flex: 1,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  analyticsCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    flexBasis: '100%',
    marginBottom: spacing.sm,
  },
  analyticsCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSoft,
    textTransform: 'uppercase',
  },
  analyticsCardMetric: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    marginVertical: 4,
  },
  analyticsCardDesc: {
    fontSize: 10,
    color: colors.textMuted,
    lineHeight: 14,
  },
});

export default GlobalAnalyticsScreen;
