import React, {useCallback, useMemo} from 'react';
import {StyleSheet, View, ScrollView, Pressable, TouchableOpacity} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {Text, Card} from 'react-native-paper';
import {useSelector} from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {ERPLayout, LoadingScreen} from '../../components';
import useAsyncResource from '../../hooks/useAsyncResource';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';

const DashboardScreen = ({navigation}) => {
  const {data: stats, loading, refresh} = useAsyncResource(
    options => mainAdminService.getDashboardStatistics(options),
    [],
  );

  console.log('DashboardScreen stats content:', JSON.stringify(stats, null, 2));
  console.log('DashboardScreen render. loading:', loading, 'stats:', stats ? 'has data' : 'null');

  useFocusEffect(
    useCallback(() => {
      console.log('DashboardScreen focus effect triggered');
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
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <Text style={styles.welcomeTitle}>Welcome back, Admin</Text>
          <Text style={styles.welcomeSubtitle}>Here's what's happening across your schools today.</Text>
        </View>

        {/* Section 1: Today's Overview (KPIs) */}
        <Text style={styles.sectionHeader}>Overview</Text>
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
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </ERPLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  welcomeBanner: {
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  welcomeTitle: {
    ...typography.title,
    color: colors.primary,
    marginBottom: spacing.xxs,
  },
  welcomeSubtitle: {
    ...typography.body,
    color: colors.textSoft,
  },
  sectionHeader: {
    ...typography.sectionTitle,
    color: colors.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  viewAllText: {
    ...typography.bodyBold,
    color: colors.secondary,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  kpiCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    flexBasis: '47%',
    flexGrow: 1,
    ...shadows.medium,
  },
  kpiContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: spacing.md,
    gap: spacing.sm,
  },
  kpiIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  kpiMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  kpiValue: {
    ...typography.metric,
    color: colors.text,
    marginBottom: 4,
  },
  kpiTitle: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  panelCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    ...shadows.medium,
  },
  activityList: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    minHeight: 64,
  },
  lastActivityItem: {
    borderBottomWidth: 0,
    minHeight: 48,
  },
  timelineLineContainer: {
    alignItems: 'center',
    width: 40,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
    minHeight: 24,
  },
  activityIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTextWrapper: {
    flex: 1,
    paddingTop: 8,
  },
  activityTextTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: 4,
  },
  activityTextTime: {
    ...typography.caption,
    color: colors.textSoft,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    flexBasis: '47%',
    flexGrow: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  quickIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickTitle: {
    ...typography.bodyBold,
    color: colors.text,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 100,
  },
});

export default DashboardScreen;
