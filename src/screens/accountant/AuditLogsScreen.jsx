import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Pressable,
  ScrollView,
} from 'react-native';
import {IconButton, Searchbar} from 'react-native-paper';
import {colors, spacing, radius, shadows} from '../../theme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const AUDIT_LOGS = [
  {
    id: 'l1',
    action: 'PAYMENT_RECORDED',
    title: 'Offline Cash Payment Recorded',
    description: 'Received ₹15,000 from Aarav Sharma (STU-2026-0043) for Tuition Fee.',
    operator: 'Jane Doe, CPA',
    timestamp: '2026-06-09T17:30:00Z',
    receiptNo: 'REC-26-8941',
  },
  {
    id: 'l2',
    action: 'PAYMENT_RECORDED',
    title: 'Offline Cash Payment Recorded',
    description: 'Received ₹12,500 from Priya Patel (STU-2026-0102) for Admission Fee.',
    operator: 'Jane Doe, CPA',
    timestamp: '2026-06-09T14:15:00Z',
    receiptNo: 'REC-26-8939',
  },
  {
    id: 'l3',
    action: 'RESULT_POSTED',
    title: 'Subject Term Marks Posted',
    description: 'Published Advanced Mathematics results for Grade XII-A to parent portal.',
    operator: 'Jane Doe, CPA',
    timestamp: '2026-06-08T16:00:00Z',
    details: '32 students posted successfully.',
  },
  {
    id: 'l4',
    action: 'NOTIFICATION_SENT',
    title: 'Notification Broadcast Dispatched',
    description: 'Sent message "Term II Fee Dues Reminder" to Parents Only.',
    operator: 'Jane Doe, CPA',
    timestamp: '2026-06-08T11:30:00Z',
    details: 'Delivered to 184 active parent app tokens.',
  },
  {
    id: 'l5',
    action: 'PAYMENT_RECORDED',
    title: 'Offline Cash Payment Recorded',
    description: 'Received ₹8,000 from Rohan Verma (STU-2026-0012) for Exam Fee.',
    operator: 'Jane Doe, CPA',
    timestamp: '2026-06-08T10:45:00Z',
    receiptNo: 'REC-26-8938',
  },
  {
    id: 'l6',
    action: 'USER_LOGIN',
    title: 'Portal Secure Authentication',
    description: 'Jane Doe logged into NSRIT Accounting Console from IP 192.168.1.45.',
    operator: 'System Auth',
    timestamp: '2026-06-09T09:00:00Z',
  },
  {
    id: 'l7',
    action: 'RESULT_POSTED',
    title: 'Subject Term Marks Posted',
    description: 'Published Business Studies results for Grade XI-B to parent portal.',
    operator: 'Jane Doe, CPA',
    timestamp: '2026-06-04T15:20:00Z',
    details: '34 students posted successfully.',
  },
];

const AuditLogsScreen = ({navigation}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const filterOptions = ['ALL', 'PAYMENTS', 'RESULTS', 'ALERTS', 'AUTH'];

  const getFilteredLogs = () => {
    return AUDIT_LOGS.filter(log => {
      const matchesSearch =
        log.title.toLowerCase().includes(searchText.toLowerCase()) ||
        log.description.toLowerCase().includes(searchText.toLowerCase()) ||
        (log.receiptNo && log.receiptNo.toLowerCase().includes(searchText.toLowerCase()));

      let matchesFilter = true;
      if (selectedFilter === 'PAYMENTS') {
        matchesFilter = log.action === 'PAYMENT_RECORDED';
      } else if (selectedFilter === 'RESULTS') {
        matchesFilter = log.action === 'RESULT_POSTED';
      } else if (selectedFilter === 'ALERTS') {
        matchesFilter = log.action === 'NOTIFICATION_SENT';
      } else if (selectedFilter === 'AUTH') {
        matchesFilter = log.action === 'USER_LOGIN';
      }

      return matchesSearch && matchesFilter;
    });
  };

  const getActionIcon = action => {
    switch (action) {
      case 'PAYMENT_RECORDED':
        return {name: 'cash-register', color: colors.success, bg: colors.successSoft};
      case 'RESULT_POSTED':
        return {name: 'clipboard-check-outline', color: colors.purple, bg: colors.purpleSoft};
      case 'NOTIFICATION_SENT':
        return {name: 'megaphone-outline', color: colors.warning, bg: colors.warningSoft};
      case 'USER_LOGIN':
        return {name: 'shield-key-outline', color: colors.info, bg: colors.infoSoft};
      default:
        return {name: 'eye-outline', color: colors.textMuted, bg: colors.background};
    }
  };

  const formatLogTime = timestamp => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return timestamp;
    }
  };

  const renderLogItem = ({item}) => {
    const iconConfig = getActionIcon(item.action);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconWrapper}>
            <View style={[styles.iconCircle, {backgroundColor: iconConfig.bg}]}>
              <MaterialCommunityIcons name={iconConfig.name} size={18} color={iconConfig.color} />
            </View>
            <View style={styles.titleWrapper}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.operatorText}>Operated by: {item.operator}</Text>
            </View>
          </View>
          <Text style={styles.timeText}>{formatLogTime(item.timestamp)}</Text>
        </View>

        <Text style={styles.descriptionText}>{item.description}</Text>

        {Boolean(item.receiptNo || item.details) && (
          <View style={styles.metaRow}>
            {item.receiptNo ? (
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>Receipt: {item.receiptNo}</Text>
              </View>
            ) : null}
            {item.details ? (
              <Text style={styles.detailsText}>{item.details}</Text>
            ) : null}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconButton
            icon="arrow-left"
            iconColor={colors.text}
            size={24}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <View>
            <Text style={styles.headerTitle}>System Audit Logs</Text>
            <Text style={styles.headerSubtitle}>General finance & marks transaction journal</Text>
          </View>
        </View>
      </View>

      {/* Filter panel */}
      <View style={styles.filterPanel}>
        <Searchbar
          placeholder="Filter audit description or voucher..."
          onChangeText={setSearchText}
          value={searchText}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          placeholderTextColor={colors.textSoft}
          iconColor={colors.textMuted}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}>
          {filterOptions.map(option => {
            const isSelected = selectedFilter === option;
            return (
              <Pressable
                key={option}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipSelected,
                ]}
                onPress={() => setSelectedFilter(option)}>
                <Text
                  style={[
                    styles.filterChipLabel,
                    isSelected && styles.filterChipLabelSelected,
                  ]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Logs List */}
      <FlatList
        data={getFilteredLogs()}
        keyExtractor={item => item.id}
        renderItem={renderLogItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="shield-search"
              size={48}
              color={colors.textSoft}
            />
            <Text style={styles.emptyTitle}>No audit logs matches</Text>
            <Text style={styles.emptySubtitle}>
              Ensure keyword spelling is correct or toggle filter tab categories.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 2,
    ...shadows.soft,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    margin: 0,
    marginRight: spacing.xs,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  filterPanel: {
    backgroundColor: colors.white,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    elevation: 0,
    borderWidth: 1,
    borderColor: colors.border,
    height: 44,
  },
  searchInput: {
    fontSize: 13,
    color: colors.text,
    alignSelf: 'center',
  },
  filterScroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  filterChip: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  filterChipLabelSelected: {
    color: colors.white,
  },
  listContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    elevation: 1,
    ...shadows.soft,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  iconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  titleWrapper: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  operatorText: {
    fontSize: 10,
    color: colors.textSoft,
    fontWeight: '600',
    marginTop: 1,
  },
  timeText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
    marginLeft: spacing.xs,
  },
  descriptionText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.background,
  },
  metaBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  metaBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
  },
  detailsText: {
    fontSize: 11,
    color: colors.textSoft,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: spacing.xxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: spacing.xl,
    lineHeight: 18,
  },
});

export default AuditLogsScreen;
