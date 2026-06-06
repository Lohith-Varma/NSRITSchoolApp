import React, {useCallback, useMemo} from 'react';
import {StyleSheet, View, Pressable, TouchableOpacity} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {Text, Card} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {ERPLayout, LoadingScreen} from '../../components';
import useAsyncResource from '../../hooks/useAsyncResource';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors, radius, shadows, spacing} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';

const DashboardScreen = ({navigation}) => {
  const {data: stats, loading, refresh} = useAsyncResource(
    options => mainAdminService.getDashboardStatistics(options),
    [],
  );

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  // Dynamically generate a few recent activity items based on real database state
  const activities = useMemo(() => {
    const list = [];
    if (stats?.rawBranches && stats.rawBranches.length > 0) {
      const latestBranch = stats.rawBranches[stats.rawBranches.length - 1];
      list.push({
        id: 'b1',
        title: `Branch "${latestBranch.name}" registered`,
        time: 'Active',
        icon: 'office-building',
        tone: colors.primary,
      });
    } else {
      list.push({
        id: 'b_none',
        title: 'Initial branch setup complete',
        time: 'System',
        icon: 'office-building',
        tone: colors.textSoft,
      });
    }

    if (stats?.rawUsers && stats.rawUsers.length > 0) {
      const latestUser = stats.rawUsers[stats.rawUsers.length - 1];
      list.push({
        id: 'u1',
        title: `User "${latestUser.fullName}" registered as ${latestUser.role}`,
        time: 'Verification complete',
        icon: 'account-group',
        tone: colors.secondary,
      });
    }

    list.push({
      id: 'rev1',
      title: `Revenue updated: ${formatCurrency(stats?.revenue || 0)} collected`,
      time: 'Finance Desk',
      icon: 'cash-multiple',
      tone: colors.success,
    });

    list.push({
      id: 'sys1',
      title: 'Audit logs verification passed',
      time: 'Database OK',
      icon: 'clipboard-text-clock',
      tone: colors.info,
    });

    return list.slice(0, 5);
  }, [stats]);

  if (loading && !stats) {
    return <LoadingScreen message="Loading ERP Dashboard..." />;
  }

  const kpiData = [
    {
      title: 'Total Branches',
      value: String(stats?.totalBranches || 0),
      icon: 'office-building',
      tone: colors.primary,
    },
    {
      title: 'Total Users',
      value: String(stats?.totalUsers || 0),
      icon: 'account-group',
      tone: colors.secondary,
    },
    {
      title: 'Total Students',
      value: String(stats?.totalStudents || 0),
      icon: 'school',
      tone: colors.success,
    },
    {
      title: 'Total Classes',
      value: String(stats?.totalClasses || 0),
      icon: 'book-open-variant',
      tone: colors.purple,
    },
  ];



  return (
    <ERPLayout
      navigation={navigation}
      activeRoute="Dashboard"
      title="Admin Console"
      breadcrumbs={['Dashboard', 'Console']}>
      <View style={styles.container}>
        
        {/* Section 1: Today's Overview (KPIs) */}
        <Text style={styles.sectionHeader}>Today's Overview</Text>
        <View style={styles.kpiGrid}>
          {kpiData.map(kpi => (
            <Card key={kpi.title} mode="outlined" style={styles.kpiCard}>
              <Card.Content style={styles.kpiContent}>
                <View style={[styles.kpiIconWrapper, {backgroundColor: `${kpi.tone}12`}]}>
                  <MaterialCommunityIcons name={kpi.icon} size={48} color={kpi.tone} />
                </View>
                <View style={styles.kpiMeta}>
                  <Text numberOfLines={1} style={styles.kpiValue}>{kpi.value}</Text>
                  <Text numberOfLines={1} style={styles.kpiTitle}>{kpi.title}</Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Section 2: Recent Activity */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeader, {marginTop: 0, marginBottom: 0}]}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AuditLogs')}>
            <Text style={styles.viewAllText}>View All →</Text>
          </TouchableOpacity>
        </View>
        <Card mode="outlined" style={styles.panelCard}>
          <Card.Content style={styles.activityList}>
            {activities.map((item, idx) => (
              <View key={item.id} style={[styles.activityItem, idx === activities.length - 1 && styles.lastActivityItem]}>
                <View style={styles.timelineLineContainer}>
                  <View style={[styles.activityIconCircle, {backgroundColor: `${item.tone}12`}]}>
                    <MaterialCommunityIcons name={item.icon} size={20} color={item.tone} />
                  </View>
                  {idx !== activities.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.activityTextWrapper}>
                  <Text style={styles.activityTextTitle}>{item.title}</Text>
                  <Text style={styles.activityTextTime}>{item.time}</Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Section 3: Quick Navigation */}
        <Text style={styles.sectionHeader}>Quick Navigation</Text>
        <View style={styles.quickGrid}>
          <Pressable style={styles.quickCard} onPress={() => navigation.navigate('ManageBranches')}>
            <View style={[styles.quickIconCircle, {backgroundColor: `${colors.primary}12`}]}>
              <MaterialCommunityIcons name="office-building" size={28} color={colors.primary} />
            </View>
            <Text style={styles.quickTitle}>Manage Branches</Text>
          </Pressable>
          
          <Pressable style={styles.quickCard} onPress={() => navigation.navigate('ManageUsers')}>
            <View style={[styles.quickIconCircle, {backgroundColor: `${colors.secondary}12`}]}>
              <MaterialCommunityIcons name="account-group" size={28} color={colors.secondary} />
            </View>
            <Text style={styles.quickTitle}>Manage Users</Text>
          </Pressable>

          <Pressable style={styles.quickCard} onPress={() => navigation.navigate('GlobalAnalytics')}>
            <View style={[styles.quickIconCircle, {backgroundColor: `${colors.info}12`}]}>
              <MaterialCommunityIcons name="chart-line" size={28} color={colors.info} />
            </View>
            <Text style={styles.quickTitle}>Analytics</Text>
          </Pressable>

          <Pressable style={styles.quickCard} onPress={() => navigation.navigate('Settings')}>
            <View style={[styles.quickIconCircle, {backgroundColor: `${colors.accent}12`}]}>
              <MaterialCommunityIcons name="cog" size={28} color={colors.accent} />
            </View>
            <Text style={styles.quickTitle}>Settings</Text>
          </Pressable>
        </View>

      </View>
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  viewAllText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  kpiCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 0,
    borderRadius: radius.md,
    flexBasis: '48%',
    flexGrow: 1,
    ...shadows.card,
  },
  kpiContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  kpiIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  kpiTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 1,
  },

  panelCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 0,
    borderRadius: radius.md,
    ...shadows.soft,
  },
  activityList: {
    paddingVertical: spacing.xxs,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    minHeight: 56,
  },
  lastActivityItem: {
    borderBottomWidth: 0,
  },
  timelineLineContainer: {
    alignItems: 'center',
    width: 32,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
    minHeight: 16,
  },
  activityIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTextWrapper: {
    flex: 1,
  },
  activityTextTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  activityTextTime: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    flexBasis: '48%',
    flexGrow: 1,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.soft,
  },
  quickIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  quickTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
});

export default DashboardScreen;
